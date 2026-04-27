import { EnvConfig } from './loader';

export interface SplitOptions {
  delimiter?: string;
  maxParts?: number;
  trim?: boolean;
}

export interface SplitResult {
  key: string;
  original: string;
  parts: string[];
}

export interface SplitConfigResult {
  results: SplitResult[];
  skipped: string[];
}

export function splitValue(
  value: string,
  options: SplitOptions = {}
): string[] {
  const { delimiter = ',', maxParts, trim = true } = options;
  const parts = maxParts !== undefined
    ? value.split(delimiter, maxParts)
    : value.split(delimiter);
  return trim ? parts.map(p => p.trim()) : parts;
}

export function splitConfig(
  config: EnvConfig,
  keys: string[],
  options: SplitOptions = {}
): SplitConfigResult {
  const results: SplitResult[] = [];
  const skipped: string[] = [];

  for (const key of keys) {
    const value = config[key];
    if (value === undefined) {
      skipped.push(key);
      continue;
    }
    const parts = splitValue(value, options);
    results.push({ key, original: value, parts });
  }

  return { results, skipped };
}

export function splitBothConfigs(
  staging: EnvConfig,
  production: EnvConfig,
  keys: string[],
  options: SplitOptions = {}
): { staging: SplitConfigResult; production: SplitConfigResult } {
  return {
    staging: splitConfig(staging, keys, options),
    production: splitConfig(production, keys, options),
  };
}

export function loadSplitOptionsFromEnv(): SplitOptions {
  return {
    delimiter: process.env.SPLIT_DELIMITER ?? ',',
    maxParts: process.env.SPLIT_MAX_PARTS
      ? parseInt(process.env.SPLIT_MAX_PARTS, 10)
      : undefined,
    trim: process.env.SPLIT_TRIM !== 'false',
  };
}
