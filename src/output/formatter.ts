export type OutputFormat = 'table' | 'json' | 'dotenv';

export interface DiffEntry {
  key: string;
  staging?: string;
  production?: string;
  status: 'added' | 'removed' | 'changed' | 'unchanged';
}

export function formatTable(entries: DiffEntry[]): string {
  const lines: string[] = [];
  const colWidths = { key: 20, staging: 30, production: 30 };

  const pad = (s: string, n: number) => s.slice(0, n).padEnd(n);
  const header = `${pad('KEY', colWidths.key)} ${pad('STAGING', colWidths.staging)} ${pad('PRODUCTION', colWidths.production)}`;
  lines.push(header);
  lines.push('-'.repeat(header.length));

  for (const entry of entries) {
    const prefix =
      entry.status === 'added' ? '+' :
      entry.status === 'removed' ? '-' :
      entry.status === 'changed' ? '~' : ' ';
    lines.push(
      `${prefix} ${pad(entry.key, colWidths.key - 2)} ${pad(entry.staging ?? '(none)', colWidths.staging)} ${pad(entry.production ?? '(none)', colWidths.production)}`
    );
  }

  return lines.join('\n');
}

export function formatJson(entries: DiffEntry[]): string {
  return JSON.stringify(entries, null, 2);
}

export function formatDotenv(entries: DiffEntry[], env: 'staging' | 'production'): string {
  return entries
    .filter(e => e[env] !== undefined)
    .map(e => `${e.key}=${e[env]}`)
    .join('\n');
}

export function formatOutput(entries: DiffEntry[], format: OutputFormat, env?: 'staging' | 'production'): string {
  switch (format) {
    case 'table': return formatTable(entries);
    case 'json': return formatJson(entries);
    case 'dotenv': return formatDotenv(entries, env ?? 'staging');
  }
}

/**
 * Returns a summary line describing the diff results, e.g.:
 * "3 added, 1 removed, 2 changed, 10 unchanged"
 */
export function formatSummary(entries: DiffEntry[]): string {
  const counts = { added: 0, removed: 0, changed: 0, unchanged: 0 };
  for (const entry of entries) {
    counts[entry.status]++;
  }
  return (Object.entries(counts) as [keyof typeof counts, number][])
    .filter(([, count]) => count > 0)
    .map(([status, count]) => `${count} ${status}`)
    .join(', ');
}
