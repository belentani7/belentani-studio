import { describe, expect, it } from "vitest";
import { decryptCVData, encryptCVData, isEncryptedCvEnvelope } from "./cvCrypto";
import { CVInputSchema, sanitizeInlineText, sanitizeMultilineText } from "./cvValidation";

describe("protección de datos de CV", () => {
  it("cifra datos sensibles sin dejar texto personal visible en el sobre persistido", () => {
    const original = { fullName: "Ana <López>", email: "ana@example.com", summary: "Experiencia confidencial" };
    const stored = encryptCVData(original);
    expect(stored.algorithm).toBe("AES-256-GCM");
    expect(stored.payload).not.toContain("ana@example.com");
    expect(isEncryptedCvEnvelope(stored)).toBe(true);
    expect(isEncryptedCvEnvelope(original)).toBe(false);
    expect(decryptCVData<typeof original>(stored)).toEqual(original);
  });

  it("limpia marcas HTML, caracteres de control y espacios anómalos", () => {
    expect(sanitizeInlineText("  Ana<script>alert(1)</script>\u0000 López  ")).toBe("Ana alert(1) López");
    expect(sanitizeMultilineText("Texto\r\n\r\n\r\n<b>seguro</b>")).toBe("Texto\n\nseguro");
  });

  it("rechaza claves inesperadas y teléfonos con contenido no permitido", () => {
    const common = { fullName: "Ana López", email: "ana@example.com", experience: [], education: [], skills: [] };
    expect(() => CVInputSchema.parse({ ...common, injected: "x" })).toThrow();
    expect(() => CVInputSchema.parse({ ...common, phone: "<img src=x>" })).toThrow();
    expect(() => CVInputSchema.parse({ ...common, skills: Array.from({ length: 41 }, () => "Atención") })).toThrow();
  });
});
