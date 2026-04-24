import { EnvConfig } from './loader';

export interface FilterOptions {
  keys?: string[];
  prefix?: string;
  regex?: RegExp | string;
  invert?: boolean;
}

export interface FilterResult {
  original: EnvConfig;
  filtered: EnvConfig;
  included: string[];
  excluded: string[];
}

export function filterConfig(config: EnvConfig, options: FilterOptions): FilterResult {
  const { keys, prefix, regex, invert = false } = options;
  const pattern = regex instanceof RegExp ? regex : regex ? new RegExp(regex) : null;

  const included: string[] = [];
  const excluded: string[] = [];
  const filtered: EnvConfig = {};

  for (const key of Object.keys(config)) {
    let match = true;

    if (keys && keys.length > 0) {
      match = keys.includes(key);
    } else if (prefix) {
      match = key.startsWith(prefix);
    } else if (pattern) {
      match = pattern.test(key);
    }

    const include = invert ? !match : match;

    if (include) {
      filtered[key] = config[key];
      included.push(key);
    } else {
      excluded.push(key);
    }
  }

  return { original: config, filtered, included, excluded };
}

export function filterBothConfigs(
  staging: EnvConfig,
  production: EnvConfig,
  options: FilterOptions
): { staging: FilterResult; production: FilterResult } {
  return {
    staging: filterConfig(staging, options),
    production: filterConfig(production, options),
  };
}

export function loadFilterOptionsFromEnv(): FilterOptions {
  const options: FilterOptions = {};
  if (process.env.STACKDIFF_FILTER_KEYS) {
    options.keys = process.env.STACKDIFF_FILTER_KEYS.split(',').map((k) => k.trim());
  }
  if (process.env.STACKDIFF_FILTER_PREFIX) {
    options.prefix = process.env.STACKDIFF_FILTER_PREFIX;
  }
  if (process.env.STACKDIFF_FILTER_REGEX) {
    options.regex = new RegExp(process.env.STACKDIFF_FILTER_REGEX);
  }
  if (process.env.STACKDIFF_FILTER_INVERT === 'true') {
    options.invert = true;
  }
  return options;
}
