import { describe, expect, it } from "vitest";
import { appRouter, getSafeOrigin } from "./routers";
import type { TrpcContext } from "./_core/context";

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
});
