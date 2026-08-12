import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { registerStorageProxy } from "./storageProxy";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import { getDocumentById, setDocumentPdfUrl } from "../db";
import { storagePut, storageGetSignedUrl } from "../storage";
import { generateCVPDF } from "./pdfGenerator";
import { getTranslatedCourse, isSupportedCourseLanguage } from "./courseTranslation";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  const app = express();
  const server = createServer(app);
  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  registerStorageProxy(app);
  registerOAuthRoutes(app);

  app.post("/api/cv/photo", async (req, res) => {
    try {
      const ctx = await createContext({ req, res } as any);
      if (!ctx.user) return res.status(401).json({ error: "No autenticado" });
      const dataUrl = typeof req.body?.dataUrl === "string" ? req.body.dataUrl : "";
      const match = dataUrl.match(/^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/);
      if (!match || match[2].length > 7_000_000) return res.status(400).json({ error: "Imagen inválida o demasiado grande" });
      const buffer = Buffer.from(match[2], "base64");
      const stored = await storagePut(`users/${ctx.user.id}/photo`, buffer, match[1]);
      return res.json({ url: stored.url, key: stored.key });
    } catch (error) {
      console.error("[PhotoUpload]", error);
      return res.status(500).json({ error: "No se pudo guardar la foto" });
    }
  });

  app.get("/api/cv/:documentId/pdf", async (req, res) => {
    try {
      const ctx = await createContext({ req, res } as any);
      if (!ctx.user) return res.status(401).json({ error: "No autenticado" });
      const documentId = Number(req.params.documentId);
      if (!Number.isInteger(documentId)) return res.status(400).json({ error: "Documento inválido" });
      const document = await getDocumentById(documentId, ctx.user.id);
      if (!document) return res.status(404).json({ error: "Documento no encontrado" });
      const cvData = document.cvData as any;
      let photoBuffer: Buffer | undefined;
      if (typeof cvData.photoUrl === "string" && cvData.photoUrl.startsWith("/manus-storage/")) {
        const key = cvData.photoUrl.replace(/^\/manus-storage\//, "");
        const signedUrl = await storageGetSignedUrl(key);
        const photoResponse = await fetch(signedUrl);
        if (photoResponse.ok) photoBuffer = Buffer.from(await photoResponse.arrayBuffer());
      }
      const pdf = await generateCVPDF({ ...cvData, photoBuffer });
      const stored = await storagePut(`users/${ctx.user.id}/cv-${documentId}.pdf`, pdf, "application/pdf");
      await setDocumentPdfUrl(documentId, ctx.user.id, stored.url);
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename="belentani-cv-${documentId}.pdf"`);
      return res.send(pdf);
    } catch (error) {
      console.error("[PDF]", error);
      return res.status(500).json({ error: "No se pudo generar el PDF" });
    }
  });

  app.get("/api/courses/:language", async (req, res) => {
    try {
      const language = String(req.params.language);
      if (!isSupportedCourseLanguage(language)) return res.status(400).json({ error: "Idioma no soportado" });
      return res.json({ language, content: await getTranslatedCourse(language) });
    } catch (error) {
      console.error("[Courses]", error);
      return res.status(502).json({ error: "No se pudo traducir el material" });
    }
  });

  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
