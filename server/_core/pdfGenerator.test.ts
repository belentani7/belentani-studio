import { describe, expect, it } from "vitest";
import { generateCVPDF } from "./pdfGenerator";

describe("generateCVPDF", () => {
  it("genera un PDF descargable con los datos del CV", async () => {
    const pdf = await generateCVPDF({
      fullName: "Persona de prueba",
      email: "persona@example.com",
      phone: "+34 600 000 000",
      location: "Barcelona",
      summary: "Perfil profesional con experiencia en atención al cliente.",
      experience: [{ company: "Empresa", position: "Técnico", duration: "2022-2024", description: "Atención y soporte a clientes." }],
      education: [{ school: "Centro", degree: "Certificado profesional", year: "2021" }],
      skills: ["Comunicación", "Informática"],
    });
    expect(pdf.subarray(0, 5).toString()).toBe("%PDF-");
    expect(pdf.length).toBeGreaterThan(1000);
  });
});
