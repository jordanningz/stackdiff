import { EnvConfig } from './loader';

export interface CloneOptions {
  prefix?: string;
  suffix?: string;
  overwrite?: boolean;
  keys?: string[];
}

export interface CloneResult {
  source: EnvConfig;
  cloned: EnvConfig;
  renamedKeys: Array<{ from: string; to: string }>;
  skipped: string[];
}

export function cloneConfig(
  source: EnvConfig,
  options: CloneOptions = {}
): CloneResult {
  const { prefix = '', suffix = '', overwrite = true, keys } = options;
  const cloned: EnvConfig = {};
  const renamedKeys: Array<{ from: string; to: string }> = [];
  const skipped: string[] = [];

  const targetKeys = keys ? keys.filter((k) => k in source) : Object.keys(source);

  for (const key of targetKeys) {
    const newKey = `${prefix}${key}${suffix}`;

    if (!overwrite && newKey in cloned) {
      skipped.push(key);
      continue;
    }

    cloned[newKey] = source[key];
    if (newKey !== key) {
      renamedKeys.push({ from: key, to: newKey });
    }
  }

  return { source, cloned, renamedKeys, skipped };
}

export function cloneBothConfigs(
  staging: EnvConfig,
  production: EnvConfig,
  options: CloneOptions = {}
): { staging: CloneResult; production: CloneResult } {
  return {
    staging: cloneConfig(staging, options),
    production: cloneConfig(production, options),
  };
}
