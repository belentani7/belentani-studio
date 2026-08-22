import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

const dbSource = readFileSync(new URL("./db.ts", import.meta.url), "utf8");

const context = (): TrpcContext => ({
  user: { id: 7, openId: "privacy-user", name: "Persona", email: "persona@example.com", loginMethod: "test", role: "user", creditsBalance: "0", createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() },
  req: { protocol: "https", headers: { origin: "https://example.test" } } as TrpcContext["req"],
  res: {} as TrpcContext["res"],
});

describe("solicitud de rectificación", () => {
  it("rechaza categorías no permitidas antes de acceder a la base de datos", async () => {
    await expect(appRouter.createCaller(context()).privacy.requestCorrection({ scope: "email" as "profile" })).rejects.toThrow();
  });

  it("persiste solo una categoría acotada, sin explicación o contenido de la persona", () => {
    expect(dbSource).toContain('requestScope: "profile" | "documents" | "other"');
    expect(dbSource).toContain('type: "data_correction"');
    expect(dbSource).not.toContain("correctionDetails");
  });
});
