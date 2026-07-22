import { describe, it, expect } from 'vitest';
import { encryptData, decryptData, hashPassword, verifyPassword } from './encryption';

describe('Encryption', () => {
  it('encrypts and decrypts data correctly', () => {
    const original = 'test@example.com';
    const encrypted = encryptData(original);
    const decrypted = decryptData(encrypted);
    expect(decrypted).toBe(original);
  });

  it('produces different ciphertext for same plaintext', () => {
    const data = 'sensitive data';
    const enc1 = encryptData(data);
    const enc2 = encryptData(data);
    expect(enc1).not.toBe(enc2);
  });

  it('hashes and verifies passwords', () => {
    const password = 'securePassword123';
    const hash = hashPassword(password);
    expect(verifyPassword(password, hash)).toBe(true);
    expect(verifyPassword('wrongPassword', hash)).toBe(false);
  });
});
