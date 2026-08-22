import { describe, expect, it } from "vitest";
import { appRouter, getSafeOrigin } from "./routers";
import type { TrpcContext } from "./_core/context";
import { readFileSync } from "node:fs";

const serverSource = readFileSync(new URL("./_core/index.ts", import.meta.url), "utf8");

const ctx = (): TrpcContext => ({
  user: { id: 101, openId: "audit-user", name: "Audit User", email: "audit@example.com", loginMethod: "test", role: "user", creditsBalance: "0", createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() },
  req: { protocol: "https", headers: { origin: "https://belentani-mtmcq4q9.manus.space" } } as TrpcContext["req"],
  res: {} as TrpcContext["res"],
});

describe("auditoría de regresión", () => {
  it("no permite que un Origin externo controle el redirect de Stripe", () => {
    expect(getSafeOrigin({ headers: { origin: "https://evil.example" } })).toBe("https://belentani-mtmcq4q9.manus.space");
    expect(getSafeOrigin({ headers: { origin: "https://belentani-mtmcq4q9.manus.space" } })).toBe("https://belentani-mtmcq4q9.manus.space");
  });

  it("rechaza un reporte para un documento no perteneciente al usuario", async () => {
    await expect(appRouter.createCaller(ctx()).quality.report({ documentId: 999999999, issue: "Problema" })).rejects.toThrow(/Documento no encontrado/);
  });

  it("rechaza CVs con entrada excesiva antes de llamar a la IA", async () => {
    const huge = "x".repeat(3000);
    await expect(appRouter.createCaller(ctx()).cv.generate({ fullName: "Persona válida", email: "audit@example.com", summary: huge, experience: [], education: [], skills: [] })).rejects.toThrow();
  });

  it("rechaza una foto almacenada bajo otro usuario", async () => {
    await expect(appRouter.createCaller(ctx()).cv.generate({ fullName: "Persona válida", email: "audit@example.com", experience: [], education: [], skills: [], photoUrl: "/manus-storage/users/202/photo_abcd1234" })).rejects.toThrow(/Foto no perteneciente/);
  });

  it("marca los PDF privados como no cacheables y no indexables", () => {
    expect(serverSource).toContain('res.setHeader("Cache-Control", "private, no-store, max-age=0, must-revalidate")');
    expect(serverSource).toContain('res.setHeader("X-Robots-Tag", "noindex, nofollow, noarchive")');
  });

  it("expone una señal de salud mínima sin datos de configuración", () => {
    expect(serverSource).toContain('app.get("/api/health"');
    expect(serverSource).toContain('json({ status: "ok", service: "belentani" })');
    expect(serverSource).not.toContain('json({ status: "ok", databaseUrl');
  });

  it("no incorpora objetos de error de CV o respuestas de storage en los logs operativos", () => {
    expect(serverSource).toContain('console.error("[PDF] generation failed")');
    expect(serverSource).not.toContain('console.error("[PDF]", error)');
    const storageProxySource = readFileSync(new URL("./_core/storageProxy.ts", import.meta.url), "utf8");
    expect(storageProxySource).not.toContain("forgeResp.status} ${body}");
  });

  it("declara políticas restrictivas de contenido, referencia y permisos en producción", () => {
    expect(serverSource).toContain('frameAncestors: ["\'none\'"]');
    expect(serverSource).toContain('objectSrc: ["\'none\'"]');
    expect(serverSource).toContain('referrerPolicy: { policy: "strict-origin-when-cross-origin" }');
    expect(serverSource).toContain('res.setHeader("Permissions-Policy", "camera=(), geolocation=(), microphone=(), payment=(), usb=()")');
  });
});
