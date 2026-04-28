import { RedactResult } from '../config/redact';
import { dim, yellow, green, bold, red } from './color';

export function reportRedactResult(
  label: string,
  result: RedactResult,
  verbose = false
): void {
  const { redactedKeys } = result;

  if (redactedKeys.length === 0) {
    console.log(green(`✔ ${label}: no sensitive keys found`));
    return;
  }

  console.log(yellow(`⚠ ${label}: ${redactedKeys.length} key(s) redacted`));

  if (verbose) {
    for (const key of redactedKeys) {
      console.log(dim(`  - ${key}`));
    }
  }
}

export function reportRedactSummary(
  staging: RedactResult,
  production: RedactResult
): void {
  const total = new Set([
    ...staging.redactedKeys,
    ...production.redactedKeys,
  ]).size;

  console.log('');
  console.log(bold('Redact Summary'));
  console.log(dim('─'.repeat(40)));
  console.log(`  Staging redacted:    ${staging.redactedKeys.length}`);
  console.log(`  Production redacted: ${production.redactedKeys.length}`);
  console.log(`  Unique keys:         ${total}`);
}

export function reportRedactError(message: string): void {
  console.error(red(`✖ redact error: ${message}`));
}
