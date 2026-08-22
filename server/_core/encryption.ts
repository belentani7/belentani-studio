import crypto from "node:crypto";

const KEY_BYTES = 32;
const IV_BYTES = 12;
const TAG_BYTES = 16;

function getEncryptionKey(): Buffer {
  const raw = process.env.ENCRYPTION_KEY;
  if (raw && /^[0-9a-fA-F]{64}$/.test(raw)) return Buffer.from(raw, "hex");
  const sessionRootKey = process.env.JWT_SECRET;
  if (sessionRootKey && sessionRootKey.length >= 32) {
    return Buffer.from(crypto.hkdfSync(
      "sha256",
      Buffer.from(sessionRootKey, "utf8"),
      Buffer.from("belentani-cv-encryption-v1", "utf8"),
      Buffer.from("aes-256-gcm-cv-data", "utf8"),
      KEY_BYTES,
    ));
  }
  if (process.env.NODE_ENV === "production") throw new Error("A production encryption root key is required");
  return crypto.createHash("sha256").update("belentani-development-only-key").digest().subarray(0, KEY_BYTES);
}

export function encryptData(data: string): string {
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(IV_BYTES);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const ciphertext = Buffer.concat([cipher.update(data, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `v1:${iv.toString("base64url")}:${tag.toString("base64url")}:${ciphertext.toString("base64url")}`;
}

export function decryptData(encrypted: string): string {
  const [version, ivPart, tagPart, ciphertextPart] = encrypted.split(":");
  if (version !== "v1" || !ivPart || !tagPart || !ciphertextPart) throw new Error("Invalid encrypted payload");
  const key = getEncryptionKey();
  const iv = Buffer.from(ivPart, "base64url");
  const tag = Buffer.from(tagPart, "base64url");
  const ciphertext = Buffer.from(ciphertextPart, "base64url");
  if (iv.length !== IV_BYTES || tag.length !== TAG_BYTES) throw new Error("Invalid encrypted payload size");
  const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString("utf8");
}

export function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex");
}

export function verifyPassword(password: string, hash: string): boolean {
  if (!/^[a-f0-9]{64}$/i.test(hash)) return false;
  return crypto.timingSafeEqual(Buffer.from(hashPassword(password), "hex"), Buffer.from(hash, "hex"));
}
