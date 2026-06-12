import { describe, it, expect, beforeAll } from 'vitest';
import { encrypt, decrypt, hashApiKey, generateApiKey } from '@/lib/encryption';

const TEST_KEY = 'dGVzdC1lbmNyeXB0aW9uLWtleS1mb3ItdGVzdGluZy1wdXJwb3Nlcw==';

beforeAll(() => {
  process.env.ENCRYPTION_KEY = TEST_KEY;
});

describe('Encryption', () => {
  it('should encrypt and decrypt a string', () => {
    const plaintext = 'sk-test-api-key-12345';
    const encrypted = encrypt(plaintext);
    const decrypted = decrypt(encrypted);
    expect(decrypted).toBe(plaintext);
  });

  it('should produce different ciphertexts for same plaintext', () => {
    const plaintext = 'test-key';
    const encrypted1 = encrypt(plaintext);
    const encrypted2 = encrypt(plaintext);
    expect(encrypted1).not.toBe(encrypted2);
    expect(decrypt(encrypted1)).toBe(plaintext);
    expect(decrypt(encrypted2)).toBe(plaintext);
  });

  it('should hash API keys consistently', () => {
    const key = 'sk-test-123';
    const hash1 = hashApiKey(key);
    const hash2 = hashApiKey(key);
    expect(hash1).toBe(hash2);
    expect(hash1.length).toBe(64);
  });

  it('should generate API keys with prefix', () => {
    const key = generateApiKey('sk');
    expect(key.startsWith('sk_')).toBe(true);
    expect(key.length).toBeGreaterThan(10);
  });

  it('should throw on invalid encryption key', () => {
    const originalKey = process.env.ENCRYPTION_KEY;
    process.env.ENCRYPTION_KEY = 'invalid';
    expect(() => encrypt('test')).toThrow();
    process.env.ENCRYPTION_KEY = originalKey;
  });
});