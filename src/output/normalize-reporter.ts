import type { NormalizeOptions } from "../config/normalize";
import { dim, green, yellow } from "./color";

export function reportNormalizeResult(
  original: Record<string, string>,
  normalized: Record<string, string>,
  label: string
): void {
  const changedKeys = Object.keys(normalized).filter(
    (k) => original[k] !== normalized[k] || !Object.prototype.hasOwnProperty.call(original, k)
  );

  const renamedKeys = Object.keys(normalized).filter(
    (k) => !Object.prototype.hasOwnProperty.call(original, k)
  );

  console.log(dim(`[${label}] Normalize result:`));

  if (changedKeys.length === 0 && renamedKeys.length === 0) {
    console.log(green("  No changes after normalization."));
    return;
  }

  for (const key of changedKeys) {
    const before = original[key] ?? dim("(new key)");
    const after = normalized[key];
    if (before !== after) {
      console.log(`  ${yellow(key)}: ${dim(String(before))} → ${green(after)}`);
    }
  }
}

export function reportNormalizeSummary(
  staging: Record<string, string>,
  stagingNorm: Record<string, string>,
  production: Record<string, string>,
  productionNorm: Record<string, string>
): void {
  const stagingChanges = Object.keys(stagingNorm).filter(
    (k) => stagingNorm[k] !== staging[k]
  ).length;
  const productionChanges = Object.keys(productionNorm).filter(
    (k) => productionNorm[k] !== production[k]
  ).length;

  console.log(dim("Normalize summary:"));
  console.log(`  Staging:    ${yellow(String(stagingChanges))} value(s) normalized`);
  console.log(`  Production: ${yellow(String(productionChanges))} value(s) normalized`);
}

export function reportNormalizeOptions(opts: NormalizeOptions): void {
  const active = Object.entries(opts)
    .filter(([, v]) => v === true)
    .map(([k]) => k);
  if (active.length === 0) {
    console.log(dim("Normalize options: (none active)"));
  } else {
    console.log(dim(`Normalize options: ${active.join(", ")}`) );
  }
}
