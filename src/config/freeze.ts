import { ParsedConfig } from './loader';

export interface FreezeResult {
  config: ParsedConfig;
  frozenKeys: string[];
  skippedKeys: string[];
}

export interface FreezeOptions {
  keys?: string[];
  pattern?: RegExp;
  invertMatch?: boolean;
}

/**
 * Returns a frozen (read-only sealed) copy of the config,
 * tracking which keys were frozen vs skipped.
 */
export function freezeConfig(
  config: ParsedConfig,
  options: FreezeOptions = {}
): FreezeResult {
  const { keys, pattern, invertMatch = false } = options;
  const frozen: ParsedConfig = {};
  const frozenKeys: string[] = [];
  const skippedKeys: string[] = [];

  for (const [k, v] of Object.entries(config)) {
    const matchesKey = keys ? keys.includes(k) : true;
    const matchesPattern = pattern ? pattern.test(k) : true;
    const shouldFreeze = keys || pattern
      ? (keys ? matchesKey : false) || (pattern ? matchesPattern : false)
      : true;
    const effective = invertMatch ? !shouldFreeze : shouldFreeze;

    if (effective) {
      frozen[k] = v;
      frozenKeys.push(k);
    } else {
      skippedKeys.push(k);
    }
  }

  return {
    config: Object.freeze(frozen) as ParsedConfig,
    frozenKeys,
    skippedKeys,
  };
}

export function freezeBothConfigs(
  staging: ParsedConfig,
  production: ParsedConfig,
  options: FreezeOptions = {}
): { staging: FreezeResult; production: FreezeResult } {
  return {
    staging: freezeConfig(staging, options),
    production: freezeConfig(production, options),
  };
}

export function loadFreezeOptionsFromEnv(): FreezeOptions {
  const keys = process.env.STACKDIFF_FREEZE_KEYS
    ? process.env.STACKDIFF_FREEZE_KEYS.split(',').map((k) => k.trim())
    : undefined;
  const patternStr = process.env.STACKDIFF_FREEZE_PATTERN;
  const pattern = patternStr ? new RegExp(patternStr) : undefined;
  const invertMatch = process.env.STACKDIFF_FREEZE_INVERT === 'true';
  return { keys, pattern, invertMatch };
}
