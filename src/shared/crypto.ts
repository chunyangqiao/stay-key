import { AES_KEY_BITS, IV_BYTE_LENGTH, PBKDF2_ITERATIONS, SALT_BYTE_LENGTH } from "./constants";
import { randomBytes } from "./bytes";

export async function deriveAesKey(secret: string, salt: Uint8Array): Promise<CryptoKey> {
  const baseKey = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    "PBKDF2",
    false,
    ["deriveKey"],
  );

  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: salt.buffer as ArrayBuffer,
      iterations: PBKDF2_ITERATIONS,
      hash: "SHA-256",
    },
    baseKey,
    { name: "AES-GCM", length: AES_KEY_BITS },
    false,
    ["encrypt", "decrypt", "wrapKey", "unwrapKey"],
  );
}

export async function generateDek(): Promise<CryptoKey> {
  return crypto.subtle.generateKey({ name: "AES-GCM", length: AES_KEY_BITS }, true, [
    "encrypt",
    "decrypt",
  ]);
}

export async function encryptAesGcm(
  key: CryptoKey,
  plaintext: Uint8Array,
): Promise<{ iv: Uint8Array; ciphertext: Uint8Array }> {
  const iv = randomBytes(IV_BYTE_LENGTH);
  const ciphertext = new Uint8Array(
    await crypto.subtle.encrypt(
      { name: "AES-GCM", iv: iv.buffer as ArrayBuffer },
      key,
      plaintext.buffer as ArrayBuffer,
    ),
  );
  return { iv, ciphertext };
}

export async function decryptAesGcm(
  key: CryptoKey,
  iv: Uint8Array,
  ciphertext: Uint8Array,
): Promise<Uint8Array> {
  const plaintext = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: iv.buffer as ArrayBuffer },
    key,
    ciphertext.buffer as ArrayBuffer,
  );
  return new Uint8Array(plaintext);
}

export async function wrapDek(
  kek: CryptoKey,
  dek: CryptoKey,
): Promise<{ iv: Uint8Array; ciphertext: Uint8Array }> {
  const iv = randomBytes(IV_BYTE_LENGTH);
  const wrapped = new Uint8Array(
    await crypto.subtle.wrapKey("raw", dek, kek, {
      name: "AES-GCM",
      iv: iv.buffer as ArrayBuffer,
    }),
  );
  return { iv, ciphertext: wrapped };
}

export async function unwrapDek(
  kek: CryptoKey,
  iv: Uint8Array,
  ciphertext: Uint8Array,
): Promise<CryptoKey> {
  return crypto.subtle.unwrapKey(
    "raw",
    ciphertext.buffer as ArrayBuffer,
    kek,
    { name: "AES-GCM", iv: iv.buffer as ArrayBuffer },
    { name: "AES-GCM", length: AES_KEY_BITS },
    false,
    ["encrypt", "decrypt"],
  );
}

export function createSalt(): Uint8Array {
  return randomBytes(SALT_BYTE_LENGTH);
}
