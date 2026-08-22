import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

const source = readFileSync(new URL("./Dashboard.tsx", import.meta.url), "utf8");

describe("borrador local de Dashboard", () => {
  it("requiere activación explícita y excluye la foto del almacenamiento local", () => {
    expect(source).toContain('const DRAFT_KEY = "belentani.cv-draft.v1"');
    expect(source).toContain('if (!saveDraft) return;');
    expect(source).toContain('const draft = { ...formData, photoUrl: "", skillsText }');
    expect(source).toContain('photoUrl: "",');
  });
});
