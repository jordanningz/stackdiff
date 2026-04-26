import { EnvConfig } from './loader';

export interface TruncateOptions {
  maxLength: number;
  suffix?: string;
  keys?: string[];
}

export interface TruncateResult {
  config: EnvConfig;
  truncated: Record<string, { original: string; truncated: string }>;
}

export function truncateValue(
  value: string,
  maxLength: number,
  suffix = '...'
): string {
  if (value.length <= maxLength) return value;
  const cutoff = Math.max(0, maxLength - suffix.length);
  return value.slice(0, cutoff) + suffix;
}

export function truncateConfig(
  config: EnvConfig,
  options: TruncateOptions
): TruncateResult {
  const { maxLength, suffix = '...', keys } = options;
  const result: EnvConfig = {};
  const truncated: TruncateResult['truncated'] = {};

  for (const [key, value] of Object.entries(config)) {
    const shouldTruncate = !keys || keys.includes(key);
    if (shouldTruncate && value.length > maxLength) {
      const newValue = truncateValue(value, maxLength, suffix);
      result[key] = newValue;
      truncated[key] = { original: value, truncated: newValue };
    } else {
      result[key] = value;
    }
  }

  return { config: result, truncated };
}

export function truncateBothConfigs(
  staging: EnvConfig,
  production: EnvConfig,
  options: TruncateOptions
): { staging: TruncateResult; production: TruncateResult } {
  return {
    staging: truncateConfig(staging, options),
    production: truncateConfig(production, options),
  };
}

export function loadTruncateOptionsFromEnv(): Partial<TruncateOptions> {
  const opts: Partial<TruncateOptions> = {};
  if (process.env.STACKDIFF_TRUNCATE_MAX_LENGTH) {
    const n = parseInt(process.env.STACKDIFF_TRUNCATE_MAX_LENGTH, 10);
    if (!isNaN(n) && n > 0) opts.maxLength = n;
  }
  if (process.env.STACKDIFF_TRUNCATE_SUFFIX) {
    opts.suffix = process.env.STACKDIFF_TRUNCATE_SUFFIX;
  }
  if (process.env.STACKDIFF_TRUNCATE_KEYS) {
    opts.keys = process.env.STACKDIFF_TRUNCATE_KEYS.split(',').map(k => k.trim()).filter(Boolean);
  }
  return opts;
}
