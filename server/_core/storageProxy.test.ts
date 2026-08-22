import { describe, expect, it } from "vitest";
import { isSafeStorageKey } from "./storageProxy";

describe("storage proxy", () => {
  it("acepta claves de objetos normales y bloquea traversal o esquemas inyectados", () => {
    expect(isSafeStorageKey("users/42/photo_abc123")).toBe(true);
    expect(isSafeStorageKey("users/42/cv-9.pdf")).toBe(true);
    expect(isSafeStorageKey("../secreto")).toBe(false);
    expect(isSafeStorageKey("users/42/../../secreto")).toBe(false);
    expect(isSafeStorageKey("https://external.example/file")).toBe(false);
    expect(isSafeStorageKey("")).toBe(false);
  });
});
