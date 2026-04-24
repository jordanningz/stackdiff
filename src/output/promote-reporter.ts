import { PromoteResult } from "../config/promote";
import { green, yellow, dim, red } from "./color";

export function reportPromoteResult(result: PromoteResult): void {
  const promotedKeys = Object.keys(result.promoted);
  const skippedKeys = Object.keys(result.skipped);

  if (result.dryRun) {
    console.log(yellow("[dry-run] No changes written."));
  }

  if (promotedKeys.length === 0 && skippedKeys.length === 0) {
    console.log(dim("Nothing to promote."));
    return;
  }

  if (promotedKeys.length > 0) {
    console.log(green(`\nPromoted (${promotedKeys.length}):`));
    for (const key of promotedKeys) {
      const { from, to } = result.promoted[key];
      const prev = to !== undefined ? dim(` (was: ${to})`) : dim(" (new key)");
      console.log(`  ${green("+")} ${key} = ${from}${prev}`);
    }
  }

  if (skippedKeys.length > 0) {
    console.log(yellow(`\nSkipped (${skippedKeys.length}):`));
    for (const key of skippedKeys) {
      console.log(`  ${yellow("-")} ${key}: ${dim(result.skipped[key])}`);
    }
  }
}

export function reportPromoteSummary(result: PromoteResult): void {
  const p = Object.keys(result.promoted).length;
  const s = Object.keys(result.skipped).length;
  const dryTag = result.dryRun ? yellow(" [dry-run]") : "";
  if (p === 0 && s === 0) {
    console.log(dim("Promote: nothing to do."));
    return;
  }
  console.log(`\nPromote summary:${dryTag} ${green(`${p} promoted`)}, ${s > 0 ? yellow(`${s} skipped`) : dim(`${s} skipped`)}`);
}

export function reportPromoteError(message: string): void {
  console.error(red(`Promote error: ${message}`));
}
