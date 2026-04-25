import { KeyedDiffStat } from '../config/diff-stat';
import { green, red, yellow, dim } from './color';

function pct(rate: number): string {
  return (rate * 100).toFixed(1) + '%';
}

export function reportDiffStat(stat: KeyedDiffStat, label = 'diff'): void {
  console.log(`\n${label} stat:`);
  console.log(`  ${green('+')} added:     ${stat.added}`);
  console.log(`  ${red('-')} removed:   ${stat.removed}`);
  console.log(`  ${yellow('~')} changed:   ${stat.changed}`);
  console.log(`  ${dim('=')} unchanged: ${stat.unchanged}`);
  console.log(`  total:      ${stat.total}`);
  console.log(`  change rate: ${pct(stat.changeRate)}`);
}

export function reportDiffStatSummary(
  staging: KeyedDiffStat,
  production: KeyedDiffStat
): void {
  console.log('\ndiff stat comparison:');
  console.log(
    `  staging   — ${green('+' + staging.added)} ${red('-' + staging.removed)} ${yellow('~' + staging.changed)} (${pct(staging.changeRate)} changed)`
  );
  console.log(
    `  production — ${green('+' + production.added)} ${red('-' + production.removed)} ${yellow('~' + production.changed)} (${pct(production.changeRate)} changed)`
  );

  const delta = Math.abs(staging.changeRate - production.changeRate);
  if (delta < 1e-9) {
    console.log(dim('  environments have equal change rates'));
  } else if (staging.changeRate > production.changeRate) {
    console.log(yellow(`  staging has ${pct(delta)} more change than production`));
  } else {
    console.log(yellow(`  production has ${pct(delta)} more change than staging`));
  }
}

export function reportKeyLists(stat: KeyedDiffStat): void {
  if (stat.addedKeys.length) {
    console.log(green('  added:   ') + stat.addedKeys.join(', '));
  }
  if (stat.removedKeys.length) {
    console.log(red('  removed: ') + stat.removedKeys.join(', '));
  }
  if (stat.changedKeys.length) {
    console.log(yellow('  changed: ') + stat.changedKeys.join(', '));
  }
}
