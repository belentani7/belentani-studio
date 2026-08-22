import "dotenv/config";
import express from "express";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import sharp from "sharp";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { registerStorageProxy } from "./storageProxy";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import { getDocumentById, purgeExpiredPrivacyData } from "../db";
import { sdk } from "./sdk";
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

const apiLimiter = rateLimit({ windowMs: 60 * 1000, limit: 120, standardHeaders: "draft-8", legacyHeaders: false, message: { error: "Demasiadas solicitudes; inténtalo de nuevo más tarde." } });
const photoLimiter = rateLimit({ windowMs: 10 * 60 * 1000, limit: 10, standardHeaders: "draft-8", legacyHeaders: false, message: { error: "Límite de subidas alcanzado; inténtalo más tarde." } });
const pdfLimiter = rateLimit({ windowMs: 10 * 60 * 1000, limit: 20, standardHeaders: "draft-8", legacyHeaders: false, message: { error: "Límite de descargas alcanzado; inténtalo más tarde." } });
const courseLimiter = rateLimit({ windowMs: 60 * 1000, limit: 30, standardHeaders: "draft-8", legacyHeaders: false, message: { error: "Límite de traducciones alcanzado; inténtalo más tarde." } });

async function startServer() {
  const app = express();
  const server = createServer(app);
  app.set("trust proxy", 1);
  app.disable("x-powered-by");
  app.use(helmet({ contentSecurityPolicy: process.env.NODE_ENV === "production" ? undefined : false, crossOriginEmbedderPolicy: false }));
  app.use(express.json({ limit: "8mb", strict: true }));
  app.use(express.urlencoded({ limit: "1mb", extended: false }));
  registerStorageProxy(app);
  registerOAuthRoutes(app);

  app.post("/api/cv/photo", photoLimiter, async (req, res) => {
    try {
      const ctx = await createContext({ req, res } as any);
      if (!ctx.user) return res.status(401).json({ error: "No autenticado" });
      const dataUrl = typeof req.body?.dataUrl === "string" ? req.body.dataUrl : "";
      const match = dataUrl.match(/^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/);
      if (!match || match[2].length > 7_000_000) return res.status(400).json({ error: "Imagen inválida o demasiado grande" });
      const inputBuffer = Buffer.from(match[2], "base64");
      if (inputBuffer.length > 5 * 1024 * 1024) return res.status(400).json({ error: "La imagen supera 5 MB" });
      const metadata = await sharp(inputBuffer, { failOn: "error" }).metadata();
      if (!metadata.format || !["jpeg", "png", "webp"].includes(metadata.format)) return res.status(400).json({ error: "Formato de imagen no permitido" });
      const buffer = await sharp(inputBuffer, { failOn: "error" }).rotate().resize({ width: 1200, height: 1200, fit: "inside", withoutEnlargement: true }).jpeg({ quality: 82, mozjpeg: true }).toBuffer();
      const stored = await storagePut(`users/${ctx.user.id}/photo`, buffer, "image/jpeg");
      return res.json({ url: stored.url, key: stored.key });
    } catch (error) {
      console.error("[PhotoUpload]", error);
      return res.status(500).json({ error: "No se pudo guardar la foto" });
    }
  });

  app.get("/api/cv/:documentId/pdf", pdfLimiter, async (req, res) => {
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
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename="belentani-cv-${documentId}.pdf"`);
      return res.send(pdf);
    } catch (error) {
      console.error("[PDF]", error);
      return res.status(500).json({ error: "No se pudo generar el PDF" });
    }
  });

  app.get("/api/courses/:language", courseLimiter, async (req, res) => {
    try {
      const language = String(req.params.language);
      if (!isSupportedCourseLanguage(language)) return res.status(400).json({ error: "Idioma no soportado" });
      return res.json({ language, content: await getTranslatedCourse(language) });
    } catch (error) {
      console.error("[Courses]", error);
      return res.status(502).json({ error: "No se pudo traducir el material" });
    }
  });

  app.post("/api/scheduled/gdpr-purge", async (req, res) => {
    try {
      const user = await sdk.authenticateRequest(req);
      if (!user.isCron || !user.taskUid) return res.status(403).json({ error: "cron-only" });
      return res.json({ ok: true, ...(await purgeExpiredPrivacyData()) });
    } catch (error) {
      console.error("[GDPR purge]", error);
      return res.status(500).json({ error: "No se pudo ejecutar la purga GDPR" });
    }
  });

  // tRPC API
  app.use("/api/trpc", apiLimiter);
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
