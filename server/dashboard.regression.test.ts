import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const dashboardSource = readFileSync(new URL("../client/src/pages/Dashboard.tsx", import.meta.url), "utf8");
const serverSource = readFileSync(new URL("./_core/index.ts", import.meta.url), "utf8");

describe("regresión de la integración de versiones", () => {
  it("mantiene el flujo guiado de cuatro pasos y sus secciones editables", () => {
    expect(dashboardSource).toContain('const steps = ["Datos", "Experiencia", "Formación", "Revisión"]');
    expect(dashboardSource).toContain("Añadir experiencia");
    expect(dashboardSource).toContain("Añadir formación");
    expect(dashboardSource).toContain("Generar CV y guardarlo");
    expect(dashboardSource).toContain("filter((item) => item.company.trim()");
  });

  it("mantiene la descarga PDF ligada al usuario autenticado", () => {
    expect(serverSource).toContain("const document = await getDocumentById(documentId, ctx.user.id);");
    expect(serverSource).toContain('return res.status(404).json({ error: "Documento no encontrado" });');
    expect(serverSource).not.toContain("setDocumentPdfUrl(documentId, ctx.user.id, stored.url)");
    expect(serverSource).not.toContain("storagePut(`users/${ctx.user.id}/cv-${documentId}.pdf`");
  });

  it("permite informar una incidencia de un CV propio sin prometer revisión automática", () => {
    expect(dashboardSource).toContain("trpc.quality.report.useMutation()");
    expect(dashboardSource).toContain("El modo gratuito no promete una revisión automática ni un CV adicional");
    expect(dashboardSource).toContain("documentId: selectedId");
  });
});
