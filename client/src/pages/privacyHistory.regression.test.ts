import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

const source = readFileSync(new URL("./PrivacyPanel.tsx", import.meta.url), "utf8");

describe("historial de solicitudes de privacidad", () => {
  it("muestra exclusivamente la colección propia devuelta por dataExport y no requiere un endpoint público", () => {
    expect(source).toContain("data.data?.privacyRequests.map");
    expect(source).toContain("Este listado muestra solo las solicitudes asociadas a tu cuenta.");
    expect(source).not.toContain("trpc.privacy.list");
  });

  it("refresca la exportación del propio usuario después de crear solicitudes", () => {
    expect(source).toContain("utils.privacy.dataExport.invalidate()");
  });
});
