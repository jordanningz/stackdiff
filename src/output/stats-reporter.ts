import { ConfigStats } from '../config/stats';
import { dim, green, yellow, bold } from './color';

function row(label: string, value: string | number): string {
  return `  ${dim(label.padEnd(22))} ${value}`;
}

export function reportStatsResult(label: string, stats: ConfigStats): void {
  console.log(bold(`\n${label} stats:`));
  console.log(row('Total keys:', stats.totalKeys));
  console.log(row('Non-empty values:', green(String(stats.nonEmptyValues))));
  console.log(row('Empty values:', stats.emptyValues > 0 ? yellow(String(stats.emptyValues)) : '0'));
  console.log(row('Unique values:', stats.uniqueValues));
  console.log(row('Duplicate values:', stats.duplicateValues > 0 ? yellow(String(stats.duplicateValues)) : '0'));
  console.log(row('Numeric values:', stats.numericValues));
  console.log(row('Boolean-like values:', stats.booleanValues));
  console.log(row('Avg value length:', stats.avgValueLength));
  console.log(row('Max value length:', stats.maxValueLength));
  console.log(row('Min value length:', stats.minValueLength));
}

export function reportStatsSummary(
  staging: ConfigStats,
  production: ConfigStats
): void {
  console.log(bold('\nStats comparison:'));
  const keyDiff = production.totalKeys - staging.totalKeys;
  const keyDiffStr = keyDiff === 0
    ? dim('no change')
    : keyDiff > 0
      ? green(`+${keyDiff} keys`)
      : yellow(`${keyDiff} keys`);
  console.log(row('Key count delta:', keyDiffStr));

  const emptyDiff = production.emptyValues - staging.emptyValues;
  const emptyStr = emptyDiff === 0
    ? dim('no change')
    : emptyDiff > 0
      ? yellow(`+${emptyDiff} empty`)
      : green(`${emptyDiff} empty`);
  console.log(row('Empty value delta:', emptyStr));

  const dupDiff = production.duplicateValues - staging.duplicateValues;
  const dupStr = dupDiff === 0
    ? dim('no change')
    : dupDiff > 0
      ? yellow(`+${dupDiff} dupes`)
      : green(`${dupDiff} dupes`);
  console.log(row('Duplicate delta:', dupStr));
}
