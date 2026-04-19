import type { DiffEntry, OutputFormat } from './formatter';
import { formatOutput } from './formatter';
import { applyColors } from './color';

export interface PrintOptions {
  format: OutputFormat;
  color?: boolean;
  env?: 'staging' | 'production';
  onlyChanged?: boolean;
}

export function filterChanged(entries: DiffEntry[]): DiffEntry[] {
  return entries.filter(e => e.status !== 'unchanged');
}

export function printDiff(entries: DiffEntry[], options: PrintOptions): string {
  const { format, color = true, env, onlyChanged = false } = options;

  const filtered = onlyChanged ? filterChanged(entries) : entries;

  if (filtered.length === 0) {
    return 'No differences found.';
  }

  let output = formatOutput(filtered, format, env);

  if (color && format === 'table') {
    output = applyColors(output, filtered);
  }

  return output;
}

export function printSummary(entries: DiffEntry[]): string {
  const counts = { added: 0, removed: 0, changed: 0, unchanged: 0 };
  for (const e of entries) counts[e.status]++;

  const parts: string[] = [];
  if (counts.changed) parts.push(`${counts.changed} changed`);
  if (counts.added) parts.push(`${counts.added} added`);
  if (counts.removed) parts.push(`${counts.removed} removed`);
  if (counts.unchanged) parts.push(`${counts.unchanged} unchanged`);

  return `Summary: ${parts.join(', ') || 'no differences'}`;
}
