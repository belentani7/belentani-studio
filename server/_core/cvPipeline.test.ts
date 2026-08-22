import { beforeEach, describe, expect, it, vi } from "vitest";
import { afterEach } from "vitest";
import { generateCVPDF } from "./pdfGenerator";

const { invokeLLMMock } = vi.hoisted(() => ({ invokeLLMMock: vi.fn() }));
vi.mock("./llm", () => ({ invokeLLM: invokeLLMMock }));

import { enhanceCV, getCVEnhancementMode } from "./cvPipeline";

describe("CV pipeline", () => {
  beforeEach(() => { invokeLLMMock.mockReset(); vi.stubEnv("CV_ENHANCEMENT_MODE", "ai"); });
  afterEach(() => vi.unstubAllEnvs());

  it("mejora datos con IA y genera un PDF descargable", async () => {
    invokeLLMMock.mockResolvedValue({ choices: [{ message: { content: JSON.stringify({ summary: "Perfil mejorado", experience: [{ company: "Empresa", position: "Técnico", duration: "2024", description: "Atendió clientes." }] }) } }] });
    const input = { fullName: "Persona", email: "persona@example.com", experience: [{ company: "Empresa", position: "Técnico", duration: "2024", description: "Atención." }], education: [], skills: ["Informática"] };
    const enhanced = await enhanceCV(input);
    const pdf = await generateCVPDF({ ...enhanced, education: [], skills: ["Informática"] });
    expect(enhanced.summary).toBe("Perfil mejorado");
    expect(pdf.subarray(0, 5).toString()).toBe("%PDF-");
    expect(pdf.length).toBeGreaterThan(1000);
  });

  it("mantiene el modo local cuando el proveedor no entrega una mejora utilizable", async () => {
    invokeLLMMock.mockResolvedValue({ choices: [{ message: { content: "respuesta no estructurada" } }] });
    const input = { fullName: "Persona", email: "persona@example.com", summary: "Perfil inicial", experience: [], education: [], skills: ["Informática"] };
    await expect(enhanceCV(input)).resolves.toEqual(input);
  });

  it("usa modo local gratuito por defecto sin llamar al proveedor", async () => {
    vi.stubEnv("CV_ENHANCEMENT_MODE", "");
    const input = { fullName: "Persona", email: "persona@example.com", experience: [{ company: "Empresa", position: "Atención al cliente", duration: "2025", description: "" }], education: [], skills: ["Excel", "Atención"] };
    const enhanced = await enhanceCV(input);
    expect(getCVEnhancementMode()).toBe("local");
    expect(invokeLLMMock).not.toHaveBeenCalled();
    expect(enhanced.summary).toContain("Atención al cliente");
  });
});
