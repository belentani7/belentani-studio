import crypto from 'crypto';

// Generate 32-byte key for AES-256
const getEncryptionKey = (): Buffer => {
  const keyEnv = process.env.ENCRYPTION_KEY;
  if (keyEnv && keyEnv.length === 64) {
    return Buffer.from(keyEnv, 'hex');
  }
  // Default: generate random key (for dev only)
  return crypto.randomBytes(32);
};

const ENCRYPTION_KEY = getEncryptionKey();

export function encryptData(data: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', ENCRYPTION_KEY, iv);
  let encrypted = cipher.update(data, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
}

export function decryptData(encrypted: string): string {
  const parts = encrypted.split(':');
  const iv = Buffer.from(parts[0], 'hex');
  const decipher = crypto.createDecipheriv('aes-256-cbc', ENCRYPTION_KEY, iv);
  let decrypted = decipher.update(parts[1], 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

export function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

export function verifyPassword(password: string, hash: string): boolean {
  return hashPassword(password) === hash;
}
