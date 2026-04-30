import { PrefixResult } from '../config/prefix';
import { green, yellow, dim, bold } from './color';

export function reportPrefixResult(
  result: PrefixResult,
  label = 'config',
  verbose = false
): void {
  const { changed, skipped, transformed } = result;
  console.log(bold(`Prefix result for ${label}:`));

  if (changed.length === 0) {
    console.log(dim('  No keys were modified.'));
  } else {
    if (verbose) {
      for (const key of changed) {
        const newKey = Object.keys(transformed).find(
          (k) => transformed[k] === result.original[key] && k !== key
        );
        console.log(`  ${yellow(key)} → ${green(newKey ?? '?')}`);
      }
    } else {
      console.log(green(`  ${changed.length} key(s) renamed`));
    }
  }

  if (skipped.length > 0) {
    console.log(dim(`  ${skipped.length} key(s) skipped (no prefix match)`));
  }
}

export function reportPrefixSummary(
  staging: PrefixResult,
  production: PrefixResult
): void {
  console.log(bold('Prefix summary:'));
  console.log(
    `  staging:    ${green(String(staging.changed.length))} changed, ` +
      `${dim(String(staging.skipped.length) + ' skipped')}`
  );
  console.log(
    `  production: ${green(String(production.changed.length))} changed, ` +
      `${dim(String(production.skipped.length) + ' skipped')}`
  );

  const stagingKeys = new Set(Object.keys(staging.transformed));
  const prodKeys = new Set(Object.keys(production.transformed));
  const onlyInStaging = [...stagingKeys].filter((k) => !prodKeys.has(k));
  const onlyInProd = [...prodKeys].filter((k) => !stagingKeys.has(k));

  if (onlyInStaging.length > 0 || onlyInProd.length > 0) {
    console.log(yellow('  Key alignment after prefix:'));
    if (onlyInStaging.length > 0)
      console.log(dim(`    only in staging:    ${onlyInStaging.join(', ')}`));
    if (onlyInProd.length > 0)
      console.log(dim(`    only in production: ${onlyInProd.join(', ')}`));
  }
}
