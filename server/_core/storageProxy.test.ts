import { describe, expect, it } from "vitest";
import { getStorageOwnerId, isSafeStorageKey } from "./storageProxy";

describe("storage proxy", () => {
  it("acepta claves de objetos normales y bloquea traversal o esquemas inyectados", () => {
    expect(isSafeStorageKey("users/42/photo_abc123")).toBe(true);
    expect(isSafeStorageKey("users/42/cv-9.pdf")).toBe(true);
    expect(isSafeStorageKey("../secreto")).toBe(false);
    expect(isSafeStorageKey("users/42/../../secreto")).toBe(false);
    expect(isSafeStorageKey("https://external.example/file")).toBe(false);
    expect(isSafeStorageKey("")).toBe(false);
  });

  it("extrae un propietario solo de rutas privadas de usuario válidas", () => {
    expect(getStorageOwnerId("users/42/photo_abc123")).toBe(42);
    expect(getStorageOwnerId("generated/imagen.png")).toBeUndefined();
    expect(getStorageOwnerId("users/0/photo_abc123")).toBeUndefined();
    expect(getStorageOwnerId("users/no-es-numero/photo_abc123")).toBeUndefined();
  });
});
