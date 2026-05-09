
import crypto from "crypto";
import dotenv from "dotenv";

dotenv.config();  

const ALGORITHM = "aes-256-cbc";
const IV_LENGTH = 16; // AES block size

/**
 * Derives a 32-byte key from the env secret.
 * Uses SHA-256 so any length secret works correctly.
 */
function getDerivedKey(): Buffer {
  const secret = process.env.CRYPTO_SECRET_KEY;
  if (!secret) {
    throw new Error("CRYPTO_SECRET_KEY is not defined in .env");
  }
  return crypto.createHash("sha256").update(secret).digest();
}

/**
 * @param data - Level-1 encrypted string from frontend
 * @returns Level-2 encrypted string to store in MongoDB
 */
export function encryptData(data: string): string {
  if (!data) throw new Error("encryptData: data must not be empty");

  const key = getDerivedKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  const encrypted = Buffer.concat([
    cipher.update(Buffer.from(data, "utf8")),
    cipher.final(),
  ]);

  // Store as  iv_hex:encrypted_hex  so we can split on ":"
  return `${iv.toString("hex")}:${encrypted.toString("hex")}`;
}

/**
 * @param encryptedData - The double-encrypted string stored in MongoDB
 * @returns Level-1 encrypted string (still encrypted, to be sent to frontend)
 */
export function decryptData(encryptedData: string): string {
  if (!encryptedData) throw new Error("decryptData: encryptedData must not be empty");

  const parts = encryptedData.split(":");
  if (parts.length !== 2) {
    throw new Error("decryptData: invalid format, expected '<iv_hex>:<data_hex>'");
  }

  const [ivHex, encryptedHex] = parts;
  const key = getDerivedKey();
  const iv = Buffer.from(ivHex, "hex");
  const encryptedBuffer = Buffer.from(encryptedHex, "hex");

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  const decrypted = Buffer.concat([
    decipher.update(encryptedBuffer),
    decipher.final(),
  ]);

  return decrypted.toString("utf8");
}


export function decryptFrontendData(encryptedData: string): string {
  if (!encryptedData) throw new Error("decryptFrontendData: input must not be empty");

  const parts = encryptedData.split(":");
  if (parts.length !== 2) {
    throw new Error("decryptFrontendData: invalid format, expected '<iv_hex>:<data_hex>'");
  }

  const frontendKey = process.env.FRONTEND_CRYPTO_KEY;
  if (!frontendKey) {
    throw new Error("FRONTEND_CRYPTO_KEY is not defined in .env");
  }

  const [ivHex, cipherHex] = parts;

  // Derive 32-byte key from frontend secret using SHA-256 (same as CryptoJS.SHA256 on frontend)
  const key = crypto.createHash("sha256").update(frontendKey).digest();
  const iv = Buffer.from(ivHex, "hex");
  const encryptedBuffer = Buffer.from(cipherHex, "hex");

  const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);
  const decrypted = Buffer.concat([
    decipher.update(encryptedBuffer),
    decipher.final(),
  ]);

  return decrypted.toString("utf8");
}

