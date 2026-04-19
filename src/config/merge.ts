import { EnvConfig } from './loader';

export type MergeStrategy = 'prefer-staging' | 'prefer-production' | 'union' | 'intersection';

export interface MergeOptions {
  strategy: MergeStrategy;
  overrides?: Record<string, string>;
}

export function mergeConfigs(
  staging: EnvConfig,
  production: EnvConfig,
  options: MergeOptions
): EnvConfig {
  const { strategy, overrides = {} } = options;

  let merged: EnvConfig = {};

  switch (strategy) {
    case 'prefer-staging':
      merged = { ...production, ...staging };
      break;
    case 'prefer-production':
      merged = { ...staging, ...production };
      break;
    case 'union':
      merged = { ...staging, ...production };
      for (const key of Object.keys(staging)) {
        if (!(key in merged)) merged[key] = staging[key];
      }
      break;
    case 'intersection': {
      const stagingKeys = new Set(Object.keys(staging));
      for (const key of Object.keys(production)) {
        if (stagingKeys.has(key)) {
          merged[key] = production[key];
        }
      }
      break;
    }
  }

  return { ...merged, ...overrides };
}

export function mergeWithBase(
  base: EnvConfig,
  overlay: EnvConfig
): EnvConfig {
  return { ...base, ...overlay };
}
