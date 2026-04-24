import { EnvConfig } from './loader';

export interface GroupResult {
  groups: Record<string, EnvConfig>;
  ungrouped: EnvConfig;
}

export interface GroupOptions {
  delimiter?: string;
  lowercase?: boolean;
}

const DEFAULT_DELIMITER = '_';

export function groupByPrefix(
  config: EnvConfig,
  options: GroupOptions = {}
): GroupResult {
  const delimiter = options.delimiter ?? DEFAULT_DELIMITER;
  const groups: Record<string, EnvConfig> = {};
  const ungrouped: EnvConfig = {};

  for (const [key, value] of Object.entries(config)) {
    const idx = key.indexOf(delimiter);
    if (idx > 0) {
      let prefix = key.slice(0, idx);
      if (options.lowercase) prefix = prefix.toLowerCase();
      const rest = key.slice(idx + delimiter.length);
      if (!groups[prefix]) groups[prefix] = {};
      groups[prefix][rest] = value;
    } else {
      ungrouped[key] = value;
    }
  }

  return { groups, ungrouped };
}

export function groupBothConfigs(
  staging: EnvConfig,
  production: EnvConfig,
  options: GroupOptions = {}
): { staging: GroupResult; production: GroupResult } {
  return {
    staging: groupByPrefix(staging, options),
    production: groupByPrefix(production, options),
  };
}

export function listPrefixes(config: EnvConfig, delimiter = DEFAULT_DELIMITER): string[] {
  const prefixes = new Set<string>();
  for (const key of Object.keys(config)) {
    const idx = key.indexOf(delimiter);
    if (idx > 0) prefixes.add(key.slice(0, idx));
  }
  return Array.from(prefixes).sort();
}
