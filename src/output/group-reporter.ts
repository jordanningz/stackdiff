import { GroupResult } from '../config/group';
import { dim, bold, cyan, yellow } from './color';

export function reportGroupResult(
  label: string,
  result: GroupResult,
  verbose = false
): void {
  const prefixes = Object.keys(result.groups).sort();
  const ungroupedCount = Object.keys(result.ungrouped).length;

  console.log(bold(`\n[${label}] Groups (${prefixes.length}):`));

  if (prefixes.length === 0) {
    console.log(dim('  No groups found.'));
  } else {
    for (const prefix of prefixes) {
      const keys = Object.keys(result.groups[prefix]);
      console.log(`  ${cyan(prefix)} ${dim(`(${keys.length} key${keys.length !== 1 ? 's' : ''})`)}`);
      if (verbose) {
        for (const k of keys.sort()) {
          console.log(dim(`    ${prefix}_${k} = ${result.groups[prefix][k]}`));
        }
      }
    }
  }

  if (ungroupedCount > 0) {
    console.log(`  ${yellow('(ungrouped)')} ${dim(`${ungroupedCount} key${ungroupedCount !== 1 ? 's' : ''}`)}`);
    if (verbose) {
      for (const k of Object.keys(result.ungrouped).sort()) {
        console.log(dim(`    ${k} = ${result.ungrouped[k]}`));
      }
    }
  }
}

export function reportGroupSummary(
  staging: GroupResult,
  production: GroupResult
): void {
  const stagingPrefixes = new Set(Object.keys(staging.groups));
  const prodPrefixes = new Set(Object.keys(production.groups));
  const onlyInStaging = [...stagingPrefixes].filter(p => !prodPrefixes.has(p));
  const onlyInProd = [...prodPrefixes].filter(p => !stagingPrefixes.has(p));

  console.log(bold('\nGroup Summary:'));
  console.log(`  Staging groups:    ${cyan(String(stagingPrefixes.size))}`);
  console.log(`  Production groups: ${cyan(String(prodPrefixes.size))}`);
  if (onlyInStaging.length > 0)
    console.log(`  Only in staging:   ${yellow(onlyInStaging.join(', '))}`);
  if (onlyInProd.length > 0)
    console.log(`  Only in prod:      ${yellow(onlyInProd.join(', '))}`);
}
