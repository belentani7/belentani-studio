import { beforeEach, describe, expect, it, vi } from "vitest";
import { generateCVPDF } from "./pdfGenerator";

const { invokeLLMMock } = vi.hoisted(() => ({ invokeLLMMock: vi.fn() }));
vi.mock("./llm", () => ({ invokeLLM: invokeLLMMock }));

import { enhanceCVWithAI } from "./cvPipeline";

describe("CV pipeline", () => {
  beforeEach(() => invokeLLMMock.mockReset());

  it("mejora datos con IA y genera un PDF descargable", async () => {
    invokeLLMMock.mockResolvedValue({ choices: [{ message: { content: JSON.stringify({ summary: "Perfil mejorado", experience: [{ company: "Empresa", position: "Técnico", duration: "2024", description: "Atendió clientes." }] }) } }] });
    const input = { fullName: "Persona", email: "persona@example.com", experience: [{ company: "Empresa", position: "Técnico", duration: "2024", description: "Atención." }], education: [], skills: ["Informática"] };
    const enhanced = await enhanceCVWithAI(input);
    const pdf = await generateCVPDF({ ...enhanced, education: [], skills: ["Informática"] });
    expect(enhanced.summary).toBe("Perfil mejorado");
    expect(pdf.subarray(0, 5).toString()).toBe("%PDF-");
    expect(pdf.length).toBeGreaterThan(1000);
  });
});
