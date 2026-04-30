import { EnvConfig } from './loader';

export interface ConfigStats {
  totalKeys: number;
  emptyValues: number;
  nonEmptyValues: number;
  uniqueValues: number;
  duplicateValues: number;
  avgValueLength: number;
  maxValueLength: number;
  minValueLength: number;
  numericValues: number;
  booleanValues: number;
}

export function computeStats(config: EnvConfig): ConfigStats {
  const values = Object.values(config);
  const total = values.length;

  if (total === 0) {
    return {
      totalKeys: 0,
      emptyValues: 0,
      nonEmptyValues: 0,
      uniqueValues: 0,
      duplicateValues: 0,
      avgValueLength: 0,
      maxValueLength: 0,
      minValueLength: 0,
      numericValues: 0,
      booleanValues: 0,
    };
  }

  const empty = values.filter((v) => v === '').length;
  const nonEmpty = total - empty;
  const lengths = values.map((v) => v.length);
  const avgLen = lengths.reduce((a, b) => a + b, 0) / total;

  const valueCounts = new Map<string, number>();
  for (const v of values) {
    valueCounts.set(v, (valueCounts.get(v) ?? 0) + 1);
  }

  const uniqueValues = [...valueCounts.values()].filter((c) => c === 1).length;
  const duplicateValues = total - uniqueValues;

  const numericValues = values.filter((v) => v !== '' && !isNaN(Number(v))).length;
  const booleanValues = values.filter((v) =>
    ['true', 'false', '1', '0', 'yes', 'no'].includes(v.toLowerCase())
  ).length;

  return {
    totalKeys: total,
    emptyValues: empty,
    nonEmptyValues: nonEmpty,
    uniqueValues,
    duplicateValues,
    avgValueLength: Math.round(avgLen * 100) / 100,
    maxValueLength: Math.max(...lengths),
    minValueLength: Math.min(...lengths),
    numericValues,
    booleanValues,
  };
}

export function statsBothConfigs(
  staging: EnvConfig,
  production: EnvConfig
): { staging: ConfigStats; production: ConfigStats } {
  return {
    staging: computeStats(staging),
    production: computeStats(production),
  };
}
