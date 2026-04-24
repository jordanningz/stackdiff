import { RenameResult } from '../config/rename';
import { green, yellow, dim, red } from './color';

export function reportRenameResult(
  result: RenameResult,
  label: string,
  verbose = false
): void {
  console.log(`\n${label}`);

  if (result.renamed.length === 0 && result.notFound.length === 0) {
    console.log(dim('  No renames applied.'));
    return;
  }

  for (const { from, to } of result.renamed) {
    console.log(`  ${red(from)} → ${green(to)}`);
  }

  if (result.notFound.length > 0 && verbose) {
    console.log(yellow(`\n  Keys not found:`));
    for (const key of result.notFound) {
      console.log(dim(`    - ${key}`));
    }
  }
}

export function reportRenameSummary(
  staging: RenameResult,
  production: RenameResult
): void {
  const totalRenamed = staging.renamed.length + production.renamed.length;
  const totalMissing = staging.notFound.length + production.notFound.length;

  console.log(`\n${dim('Rename summary:')}`);
  console.log(`  ${green(String(totalRenamed))} key(s) renamed across both configs`);

  if (totalMissing > 0) {
    console.log(`  ${yellow(String(totalMissing))} key(s) not found (skipped)`);
  }
}

export function reportRenameError(message: string): void {
  console.error(red(`Rename error: ${message}`));
}
