import { decryptData, encryptData } from "./encryption";

export type EncryptedCvEnvelope = {
  version: "cv-v1";
  algorithm: "AES-256-GCM";
  payload: string;
};

function isEncryptedCvEnvelope(value: unknown): value is EncryptedCvEnvelope {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<EncryptedCvEnvelope>;
  return candidate.version === "cv-v1" && candidate.algorithm === "AES-256-GCM" && typeof candidate.payload === "string";
}

/** Encrypts CV data before it reaches the JSON database column. */
export function encryptCVData(data: unknown): EncryptedCvEnvelope {
  return {
    version: "cv-v1",
    algorithm: "AES-256-GCM",
    payload: encryptData(JSON.stringify(data)),
  };
}

/**
 * Decrypts current encrypted records and accepts legacy plaintext records so
 * historical user documents remain downloadable during the non-destructive migration.
 */
export function decryptCVData<T>(stored: unknown): T {
  if (!isEncryptedCvEnvelope(stored)) return stored as T;
  const decoded = JSON.parse(decryptData(stored.payload));
  if (!decoded || typeof decoded !== "object" || Array.isArray(decoded)) throw new Error("Invalid encrypted CV content");
  return decoded as T;
}
