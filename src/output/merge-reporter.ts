import { EnvConfig } from '../config/loader';
import { MergeStrategy } from '../config/merge';
import { dim, green, yellow } from './color';

export function reportMergeResult(
  merged: EnvConfig,
  staging: EnvConfig,
  production: EnvConfig,
  strategy: MergeStrategy
): void {
  console.log(dim(`Merge strategy: ${strategy}`));
  console.log('');

  const allKeys = new Set([
    ...Object.keys(staging),
    ...Object.keys(production),
  ]);

  let onlyInStaging = 0;
  let onlyInProd = 0;
  let inBoth = 0;

  for (const key of allKeys) {
    const inStaging = key in staging;
    const inProd = key in production;
    const value = merged[key] ?? '';

    if (inStaging && inProd) {
      inBoth++;
      const source = staging[key] === value ? 'staging' : 'production';
      console.log(`  ${key}=${value} ${dim(`(from ${source})`)}`)
    } else if (inStaging) {
      onlyInStaging++;
      if (key in merged) console.log(`  ${green(key)}=${value} ${dim('(staging only)')}`);
      else console.log(`  ${dim(key + ' (excluded by strategy)')}`);
    } else {
      onlyInProd++;
      if (key in merged) console.log(`  ${yellow(key)}=${value} ${dim('(production only)')}`);
      else console.log(`  ${dim(key + ' (excluded by strategy)')}`);
    }
  }

  console.log('');
  console.log(dim(`Total keys: ${Object.keys(merged).length} merged | ${onlyInStaging} staging-only | ${onlyInProd} production-only | ${inBoth} shared`));
}

export function reportMergeSummary(merged: EnvConfig, strategy: MergeStrategy): void {
  console.log(dim(`[merge] strategy=${strategy} keys=${Object.keys(merged).length}`));
}
