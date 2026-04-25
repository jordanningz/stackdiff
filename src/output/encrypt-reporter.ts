import { dim, green, yellow, red, bold } from "./color";
import { isEncrypted } from "../config/encrypt";

export function reportEncryptResult(
  original: Record<string, string>,
  result: Record<string, string>,
  label: string
): void {
  const keys = Object.keys(result);
  const encryptedKeys = keys.filter(
    (k) => isEncrypted(result[k]) && !isEncrypted(original[k])
  );
  const skippedKeys = keys.filter(
    (k) => isEncrypted(result[k]) && isEncrypted(original[k])
  );

  console.log(bold(`\n[${label}] Encrypt Result`));

  if (encryptedKeys.length === 0 && skippedKeys.length === 0) {
    console.log(dim("  No keys encrypted."));
    return;
  }

  for (const k of encryptedKeys) {
    console.log(green(`  + encrypted: ${k}`));
  }
  for (const k of skippedKeys) {
    console.log(dim(`  ~ skipped (already encrypted): ${k}`));
  }
}

export function reportDecryptResult(
  result: Record<string, string>,
  label: string
): void {
  const decryptedKeys = Object.keys(result).filter((k) => !isEncrypted(result[k]));
  console.log(bold(`\n[${label}] Decrypt Result`));
  if (decryptedKeys.length === 0) {
    console.log(dim("  Nothing decrypted."));
    return;
  }
  for (const k of decryptedKeys) {
    console.log(yellow(`  ~ decrypted: ${k}`));
  }
}

export function reportEncryptSummary(
  original: Record<string, string>,
  result: Record<string, string>
): void {
  const total = Object.keys(result).length;
  const encrypted = Object.keys(result).filter((k) => isEncrypted(result[k])).length;
  const newlyEncrypted = Object.keys(result).filter(
    (k) => isEncrypted(result[k]) && !isEncrypted(original[k])
  ).length;
  console.log(
    dim(`\nSummary: ${newlyEncrypted} newly encrypted, ${encrypted} total encrypted / ${total} keys`)
  );
}

export function reportEncryptError(key: string, err: unknown): void {
  const msg = err instanceof Error ? err.message : String(err);
  console.error(red(`  ✗ error encrypting key "${key}": ${msg}`));
}
