import { SplitConfigResult, SplitResult } from '../config/split';
import { dim, green, yellow } from './color';

export function reportSplitEntry(entry: SplitResult): void {
  const partsDisplay = entry.parts
    .map((p, i) => `  ${dim(`[${i}]`)} ${green(p)}`)
    .join('\n');
  console.log(`${entry.key} ${dim('=')} ${yellow(entry.original)}`);
  console.log(partsDisplay);
}

export function reportSplitResult(
  result: SplitConfigResult,
  label: string
): void {
  console.log(dim(`\n── ${label} ──`));

  if (result.results.length === 0 && result.skipped.length === 0) {
    console.log(dim('  no keys specified'));
    return;
  }

  for (const entry of result.results) {
    reportSplitEntry(entry);
  }

  if (result.skipped.length > 0) {
    console.log(dim(`  skipped (not found): ${result.skipped.join(', ')}`))
  }
}

export function reportSplitSummary(
  staging: SplitConfigResult,
  production: SplitConfigResult
): void {
  const stagingTotal = staging.results.reduce((n, r) => n + r.parts.length, 0);
  const prodTotal = production.results.reduce((n, r) => n + r.parts.length, 0);

  console.log(dim('\n── split summary ──'));
  console.log(
    `  staging:    ${green(String(staging.results.length))} keys split, ` +
    `${green(String(stagingTotal))} total parts`
  );
  console.log(
    `  production: ${green(String(production.results.length))} keys split, ` +
    `${green(String(prodTotal))} total parts`
  );

  if (staging.skipped.length > 0 || production.skipped.length > 0) {
    const allSkipped = new Set([...staging.skipped, ...production.skipped]);
    console.log(yellow(`  skipped keys: ${[...allSkipped].join(', ')}`))
  }
}
