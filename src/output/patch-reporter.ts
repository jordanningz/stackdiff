import { PatchOperation, PatchResult } from '../config/patch';
import { green, red, yellow, dim } from './color';

function opLabel(op: PatchOperation): string {
  if (op.op === 'set') return `set  ${green(op.key)}=${op.value}`;
  if (op.op === 'delete') return `del  ${red(op.key)}`;
  if (op.op === 'rename') return `ren  ${yellow(op.from)} → ${green(op.to)}`;
  return 'unknown';
}

export function reportPatchResult(result: PatchResult, label = 'config'): void {
  const total = result.applied.length + result.skipped.length;
  if (total === 0) {
    console.log(dim('No patch operations provided.'));
    return;
  }

  console.log(`\nPatch result for ${label}:`);

  if (result.applied.length > 0) {
    console.log(green(`  Applied (${result.applied.length}):`) );
    for (const op of result.applied) {
      console.log(`    ${opLabel(op)}`);
    }
  }

  if (result.skipped.length > 0) {
    console.log(yellow(`  Skipped (${result.skipped.length}):`) );
    for (const op of result.skipped) {
      console.log(`    ${dim(opLabel(op))}`);
    }
  }
}

export function reportPatchSummary(results: { label: string; result: PatchResult }[]): void {
  const totalApplied = results.reduce((sum, r) => sum + r.result.applied.length, 0);
  const totalSkipped = results.reduce((sum, r) => sum + r.result.skipped.length, 0);

  console.log(`\nPatch summary: ${green(`${totalApplied} applied`)}, ${yellow(`${totalSkipped} skipped`)} across ${results.length} config(s).`);
}
