import CryptoJS from 'crypto-js';

const FRONTEND_KEY = import.meta.env.VITE_CRYPTO_KEY as string;

if (!FRONTEND_KEY) {
  console.warn('[Crypto] VITE_CRYPTO_KEY is not set in .env — encryption will fail!');
}

/**
 * Encrypts a plain text string using AES (Level 1 — frontend layer).
 */
export function encryptData(plainText: string): string {
  if (!plainText) return plainText;

  const key = CryptoJS.SHA256(FRONTEND_KEY);
  const iv = CryptoJS.lib.WordArray.random(16);

  const encrypted = CryptoJS.AES.encrypt(plainText, key, {
    iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  });

  const ivHex = iv.toString(CryptoJS.enc.Hex);
  const cipherText = encrypted.ciphertext.toString(CryptoJS.enc.Hex);

  return `${ivHex}:${cipherText}`;
}

/**
 * Decrypts a Level-1 encrypted string back to plain text.
 */
export function decryptData(encryptedText: string): string {
  if (!encryptedText) return encryptedText;

  try {
    const parts = encryptedText.split(':');
    if (parts.length !== 2) return encryptedText; // not encrypted, return as-is

    const [ivHex, cipherHex] = parts;
    const key = CryptoJS.SHA256(FRONTEND_KEY);
    const iv = CryptoJS.enc.Hex.parse(ivHex);
    const cipherParams = CryptoJS.lib.CipherParams.create({
      ciphertext: CryptoJS.enc.Hex.parse(cipherHex),
    });

    const decrypted = CryptoJS.AES.decrypt(cipherParams, key, {
      iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    });

    return decrypted.toString(CryptoJS.enc.Utf8);
  } catch {
    console.error('[Crypto] Failed to decrypt value');
    return encryptedText;
  }
}

/**
 * Encrypts all fields of a student form data object.
 */
export function encryptStudentData<T extends Record<string, string>>(data: T): T {
  const encrypted = {} as T;
  for (const key in data) {
    encrypted[key] = encryptData(data[key]) as T[typeof key];
  }
  return encrypted;
}

/**
 * Decrypts all fields of a student object received from the backend.
 */
export function decryptStudentData<T extends Record<string, string>>(data: T): T {
  const decrypted = {} as T;
  for (const key in data) {
    decrypted[key] = decryptData(data[key]) as T[typeof key];
  }
  return decrypted;
}
