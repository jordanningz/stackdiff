/**
 * Deduplicate config entries by value or key pattern.
 * Useful for identifying redundant keys across configs.
 */

export interface DedupeOptions {
  caseSensitive?: boolean;
  byValue?: boolean;
  byKey?: boolean;
}

export interface DedupeResult {
  unique: Record<string, string>;
  duplicates: Array<{ keys: string[]; value: string }>;
  removed: string[];
}

export function findDuplicateValues(
  config: Record<string, string>,
  caseSensitive = true
): Array<{ keys: string[]; value: string }> {
  const valueMap = new Map<string, string[]>();

  for (const [key, value] of Object.entries(config)) {
    const normalizedValue = caseSensitive ? value : value.toLowerCase();
    const existing = valueMap.get(normalizedValue) ?? [];
    valueMap.set(normalizedValue, [...existing, key]);
  }

  return Array.from(valueMap.entries())
    .filter(([, keys]) => keys.length > 1)
    .map(([value, keys]) => ({ keys, value }));
}

export function dedupeConfig(
  config: Record<string, string>,
  options: DedupeOptions = {}
): DedupeResult {
  const { caseSensitive = true, byValue = true } = options;

  if (!byValue) {
    return { unique: { ...config }, duplicates: [], removed: [] };
  }

  const duplicates = findDuplicateValues(config, caseSensitive);
  const keysToRemove = new Set<string>();

  for (const { keys } of duplicates) {
    // Keep the first key alphabetically, remove the rest
    const sorted = [...keys].sort();
    for (const key of sorted.slice(1)) {
      keysToRemove.add(key);
    }
  }

  const unique: Record<string, string> = {};
  for (const [key, value] of Object.entries(config)) {
    if (!keysToRemove.has(key)) {
      unique[key] = value;
    }
  }

  return {
    unique,
    duplicates,
    removed: Array.from(keysToRemove).sort(),
  };
}

export function dedupeBothConfigs(
  staging: Record<string, string>,
  production: Record<string, string>,
  options: DedupeOptions = {}
): { staging: DedupeResult; production: DedupeResult } {
  return {
    staging: dedupeConfig(staging, options),
    production: dedupeConfig(production, options),
  };
}
