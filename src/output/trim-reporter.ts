import type { TrimResult } from '../config/trim';
import { dim, green, yellow } from './color';

export function reportTrimResult(
  result: TrimResult,
  label: string,
  useColor: boolean
): void {
  const changedKeys = Object.keys(result.trimmed);

  if (changedKeys.length === 0) {
    console.log(dim(`[${label}] No values needed trimming.`, useColor));
    return;
  }

  console.log(yellow(`[${label}] Trimmed ${changedKeys.length} value(s):`, useColor));

  for (const key of changedKeys) {
    const { before, after } = result.trimmed[key];
    const beforeDisplay = JSON.stringify(before);
    const afterDisplay = JSON.stringify(after);
    console.log(
      `  ${key}: ${dim(beforeDisplay, useColor)} → ${green(afterDisplay, useColor)}`
    );
  }
}

export function reportTrimSummary(
  staging: TrimResult,
  production: TrimResult,
  useColor: boolean
): void {
  const stagingCount = Object.keys(staging.trimmed).length;
  const productionCount = Object.keys(production.trimmed).length;
  const total = stagingCount + productionCount;

  if (total === 0) {
    console.log(dim('Trim summary: all values were already clean.', useColor));
  } else {
    console.log(
      yellow(
        `Trim summary: ${total} value(s) trimmed ` +
          `(staging: ${stagingCount}, production: ${productionCount}).`,
        useColor
      )
    );
  }
}
