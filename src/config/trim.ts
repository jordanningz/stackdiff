/**
 * Trim whitespace and optional surrounding quotes from config values.
 */

export interface TrimOptions {
  trimWhitespace?: boolean;
  trimQuotes?: boolean;
}

export interface TrimResult {
  config: Record<string, string>;
  trimmed: Record<string, { before: string; after: string }>;
}

const QUOTE_CHARS = ['"', "'", '`'];

export function trimValue(value: string, options: TrimOptions = {}): string {
  const { trimWhitespace = true, trimQuotes = false } = options;
  let result = trimWhitespace ? value.trim() : value;

  if (trimQuotes) {
    const first = result[0];
    const last = result[result.length - 1];
    if (first && first === last && QUOTE_CHARS.includes(first)) {
      result = result.slice(1, -1);
    }
  }

  return result;
}

export function trimConfig(
  config: Record<string, string>,
  options: TrimOptions = {}
): TrimResult {
  const trimmed: Record<string, { before: string; after: string }> = {};
  const result: Record<string, string> = {};

  for (const [key, value] of Object.entries(config)) {
    const after = trimValue(value, options);
    result[key] = after;
    if (after !== value) {
      trimmed[key] = { before: value, after };
    }
  }

  return { config: result, trimmed };
}

export function trimBothConfigs(
  staging: Record<string, string>,
  production: Record<string, string>,
  options: TrimOptions = {}
): { staging: TrimResult; production: TrimResult } {
  return {
    staging: trimConfig(staging, options),
    production: trimConfig(production, options),
  };
}

export function loadTrimOptionsFromEnv(): TrimOptions {
  return {
    trimWhitespace: process.env.STACKDIFF_TRIM_WHITESPACE !== 'false',
    trimQuotes: process.env.STACKDIFF_TRIM_QUOTES === 'true',
  };
}
