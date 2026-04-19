import { getMaskedKeys } from "../config/mask";
import { dim, yellow } from "./color";
import type { MaskOptions } from "../config/mask";

export function reportMaskedKeys(
  label: string,
  config: Record<string, string>,
  options: MaskOptions = {}
): void {
  const keys = getMaskedKeys(config, options);
  if (keys.length === 0) {
    console.log(dim(`[${label}] No sensitive keys detected.`));
    return;
  }
  console.log(yellow(`[${label}] Masked ${keys.length} sensitive key(s):`));
  for (const key of keys) {
    console.log(dim(`  - ${key}`));
  }
}

export function reportMaskSummary(
  stagingConfig: Record<string, string>,
  productionConfig: Record<string, string>,
  options: MaskOptions = {}
): void {
  const stagingKeys = getMaskedKeys(stagingConfig, options);
  const productionKeys = getMaskedKeys(productionConfig, options);
  const allKeys = Array.from(new Set([...stagingKeys, ...productionKeys]));

  if (allKeys.length === 0) {
    console.log(dim("No sensitive keys found in either environment."));
    return;
  }

  console.log(yellow(`Sensitive keys masked across environments (${allKeys.length} total):`));
  for (const key of allKeys) {
    const inStaging = stagingKeys.includes(key) ? "staging" : null;
    const inProd = productionKeys.includes(key) ? "production" : null;
    const envs = [inStaging, inProd].filter(Boolean).join(", ");
    console.log(dim(`  - ${key} (${envs})`));
  }
}
