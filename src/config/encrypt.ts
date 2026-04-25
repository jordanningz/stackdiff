import * as crypto from "crypto";

const ALGORITHM = "aes-256-cbc";
const IV_LENGTH = 16;
const KEY_LENGTH = 32;

export function deriveKey(secret: string): Buffer {
  return crypto.createHash("sha256").update(secret).digest();
}

export function encryptValue(value: string, secret: string): string {
  const key = deriveKey(secret);
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  return `enc:${iv.toString("hex")}:${encrypted.toString("hex")}`;
}

export function decryptValue(value: string, secret: string): string {
  if (!value.startsWith("enc:")) {
    throw new Error(`Value is not encrypted: ${value}`);
  }
  const parts = value.split(":");
  if (parts.length !== 3) {
    throw new Error(`Invalid encrypted value format: ${value}`);
  }
  const iv = Buffer.from(parts[1], "hex");
  const encrypted = Buffer.from(parts[2], "hex");
  const key = deriveKey(secret);
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString("utf8");
}

export function isEncrypted(value: string): boolean {
  return typeof value === "string" && value.startsWith("enc:");
}

export function encryptConfig(
  config: Record<string, string>,
  secret: string,
  keys?: string[]
): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [k, v] of Object.entries(config)) {
    const shouldEncrypt = !keys || keys.includes(k);
    result[k] = shouldEncrypt && !isEncrypted(v) ? encryptValue(v, secret) : v;
  }
  return result;
}

export function decryptConfig(
  config: Record<string, string>,
  secret: string
): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [k, v] of Object.entries(config)) {
    result[k] = isEncrypted(v) ? decryptValue(v, secret) : v;
  }
  return result;
}

export function encryptBothConfigs(
  staging: Record<string, string>,
  production: Record<string, string>,
  secret: string,
  keys?: string[]
): { staging: Record<string, string>; production: Record<string, string> } {
  return {
    staging: encryptConfig(staging, secret, keys),
    production: encryptConfig(production, secret, keys),
  };
}
