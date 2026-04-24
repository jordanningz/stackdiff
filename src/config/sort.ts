import { EnvConfig } from './loader';

export type SortOrder = 'asc' | 'desc';

export interface SortOptions {
  order?: SortOrder;
  caseSensitive?: boolean;
  priorityKeys?: string[];
}

export function sortConfig(
  config: EnvConfig,
  options: SortOptions = {}
): EnvConfig {
  const { order = 'asc', caseSensitive = false, priorityKeys = [] } = options;

  const keys = Object.keys(config);

  const sorted = keys.sort((a, b) => {
    const aPriority = priorityKeys.indexOf(a);
    const bPriority = priorityKeys.indexOf(b);

    if (aPriority !== -1 || bPriority !== -1) {
      if (aPriority === -1) return 1;
      if (bPriority === -1) return -1;
      return aPriority - bPriority;
    }

    const aKey = caseSensitive ? a : a.toLowerCase();
    const bKey = caseSensitive ? b : b.toLowerCase();

    const cmp = aKey < bKey ? -1 : aKey > bKey ? 1 : 0;
    return order === 'asc' ? cmp : -cmp;
  });

  return sorted.reduce<EnvConfig>((acc, key) => {
    acc[key] = config[key];
    return acc;
  }, {});
}

export function sortBothConfigs(
  staging: EnvConfig,
  production: EnvConfig,
  options: SortOptions = {}
): { staging: EnvConfig; production: EnvConfig } {
  return {
    staging: sortConfig(staging, options),
    production: sortConfig(production, options),
  };
}

export function loadSortOptionsFromEnv(): SortOptions {
  const order = process.env.STACKDIFF_SORT_ORDER as SortOrder | undefined;
  const caseSensitive = process.env.STACKDIFF_SORT_CASE_SENSITIVE === 'true';
  const priorityKeys = process.env.STACKDIFF_SORT_PRIORITY
    ? process.env.STACKDIFF_SORT_PRIORITY.split(',')
        .map((k) => k.trim())
        .filter(Boolean)
    : [];

  return {
    order: order === 'desc' ? 'desc' : 'asc',
    caseSensitive,
    priorityKeys,
  };
}
