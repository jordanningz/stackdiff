/**
 * pivot.ts — Restructure config by swapping keys and values,
 * or pivoting on a prefix to create a nested key map.
 */

export interface PivotResult {
  pivoted: Record<string, string>;
  skipped: string[];
  collisions: string[];
}

/**
 * Swap keys and values in a config object.
 * Keys with duplicate values will be tracked as collisions.
 * Keys with empty or whitespace-only values will be tracked as skipped.
 */
export function pivotConfig(config: Record<string, string>): PivotResult {
  const pivoted: Record<string, string> = {};
  const skipped: string[] = [];
  const collisions: string[] = [];
  const seen = new Set<string>();

  for (const [key, value] of Object.entries(config)) {
    if (!value || value.trim() === "") {
      skipped.push(key);
      continue;
    }
    if (seen.has(value)) {
      collisions.push(key);
      continue;
    }
    seen.add(value);
    pivoted[value] = key;
  }

  return { pivoted, skipped, collisions };
}

/**
 * Pivot both staging and production configs independently.
 */
export function pivotBothConfigs(
  staging: Record<string, string>,
  production: Record<string, string>
): { staging: PivotResult; production: PivotResult } {
  return {
    staging: pivotConfig(staging),
    production: pivotConfig(production),
  };
}

/**
 * Build a value-to-keys index (value may map to multiple keys across both envs).
 */
export function buildValueIndex(
  configs: Record<string, string>[]
): Record<string, string[]> {
  const index: Record<string, string[]> = {};
  for (const config of configs) {
    for (const [key, value] of Object.entries(config)) {
      if (!value) continue;
      if (!index[value]) index[value] = [];
      if (!index[value].includes(key)) index[value].push(key);
    }
  }
  return index;
}

/**
 * Filter a PivotResult to only include entries whose keys match a given prefix.
 * Useful for inspecting a subset of pivoted config (e.g. all "DB_" values).
 */
export function filterPivotedByPrefix(
  result: PivotResult,
  prefix: string
): Record<string, string> {
  return Object.fromEntries(
    Object.entries(result.pivoted).filter(([, originalKey]) =>
      originalKey.startsWith(prefix)
    )
  );
}
