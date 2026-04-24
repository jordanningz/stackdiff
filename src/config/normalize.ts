/**
 * Normalize config values: trim whitespace, unify booleans, lowercase/uppercase keys, etc.
 */

export interface NormalizeOptions {
  trimValues?: boolean;
  lowercaseKeys?: boolean;
  uppercaseKeys?: boolean;
  normalizeBoolean?: boolean;
  collapseWhitespace?: boolean;
}

const BOOLEAN_TRUE = new Set(["true", "1", "yes", "on"]);
const BOOLEAN_FALSE = new Set(["false", "0", "no", "off"]);

export function normalizeValue(value: string, opts: NormalizeOptions): string {
  let v = value;
  if (opts.trimValues) {
    v = v.trim();
  }
  if (opts.collapseWhitespace) {
    v = v.replace(/\s+/g, " ").trim();
  }
  if (opts.normalizeBoolean) {
    const lower = v.toLowerCase();
    if (BOOLEAN_TRUE.has(lower)) return "true";
    if (BOOLEAN_FALSE.has(lower)) return "false";
  }
  return v;
}

export function normalizeKey(key: string, opts: NormalizeOptions): string {
  if (opts.uppercaseKeys) return key.toUpperCase();
  if (opts.lowercaseKeys) return key.toLowerCase();
  return key;
}

export function normalizeConfig(
  config: Record<string, string>,
  opts: NormalizeOptions
): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(config)) {
    const nKey = normalizeKey(key, opts);
    const nVal = normalizeValue(value, opts);
    result[nKey] = nVal;
  }
  return result;
}

export function normalizeBothConfigs(
  staging: Record<string, string>,
  production: Record<string, string>,
  opts: NormalizeOptions
): { staging: Record<string, string>; production: Record<string, string> } {
  return {
    staging: normalizeConfig(staging, opts),
    production: normalizeConfig(production, opts),
  };
}

export function loadNormalizeOptionsFromEnv(): NormalizeOptions {
  return {
    trimValues: process.env.NORMALIZE_TRIM !== "false",
    lowercaseKeys: process.env.NORMALIZE_LOWERCASE_KEYS === "true",
    uppercaseKeys: process.env.NORMALIZE_UPPERCASE_KEYS === "true",
    normalizeBoolean: process.env.NORMALIZE_BOOLEAN === "true",
    collapseWhitespace: process.env.NORMALIZE_COLLAPSE_WHITESPACE === "true",
  };
}
