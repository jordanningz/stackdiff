import { CastConfigResult, CastResult } from '../config/cast';
import { green, yellow, red, dim } from './color';

const TYPE_LABEL: Record<string, string> = {
  string: 'str',
  number: 'num',
  boolean: 'bool',
  json: 'json',
  auto: 'auto',
};

function typeTag(type: string): string {
  return dim(`[${TYPE_LABEL[type] ?? type}]`);
}

export function reportCastEntry(entry: CastResult): void {
  const tag = typeTag(entry.type);
  if (entry.error) {
    console.log(`  ${red('✗')} ${entry.key} ${tag}  ${dim(entry.original)} → ${red('error')}: ${entry.error}`);
  } else {
    const display = JSON.stringify(entry.casted);
    const changed = display !== entry.original;
    const arrow = changed ? `${dim(entry.original)} → ${green(display)}` : green(display);
    console.log(`  ${green('✓')} ${entry.key} ${tag}  ${arrow}`);
  }
}

export function reportCastResult(label: string, result: CastConfigResult): void {
  console.log(`\n${yellow(label)}`);
  if (result.entries.length === 0) {
    console.log(dim('  (no entries)'));
    return;
  }
  for (const entry of result.entries) {
    reportCastEntry(entry);
  }
}

export function reportCastSummary(result: CastConfigResult): void {
  const total = result.entries.length;
  const ok = total - result.errors.length;
  const errCount = result.errors.length;
  console.log(
    `\n${dim('cast:')} ${green(`${ok} ok`)}` +
    (errCount > 0 ? `  ${red(`${errCount} error${errCount !== 1 ? 's' : ''}`)}` : '') +
    `  ${dim(`/ ${total} total`)}`
  );
}

export function reportCastError(message: string): void {
  console.error(`${red('error')} ${message}`);
}
