import { AuditResult, AuditEntry, AuditSeverity } from '../config/audit';
import { red, yellow, dim, green } from './color';

function severityLabel(severity: AuditSeverity): string {
  switch (severity) {
    case 'error': return red('[ERROR]');
    case 'warn':  return yellow('[WARN] ');
    case 'info':  return dim('[INFO] ');
  }
}

export function reportAuditEntry(entry: AuditEntry): string {
  const label = severityLabel(entry.severity);
  const source = dim(`(${entry.source})`);
  return `${label} ${entry.message} ${source}`;
}

export function reportAuditResult(result: AuditResult): string {
  if (result.entries.length === 0) {
    return green('✔ Audit passed — no issues found.');
  }

  const lines: string[] = ['Audit Results:', ''];

  const errors = result.entries.filter((e) => e.severity === 'error');
  const warns  = result.entries.filter((e) => e.severity === 'warn');
  const infos  = result.entries.filter((e) => e.severity === 'info');

  for (const entry of [...errors, ...warns, ...infos]) {
    lines.push(`  ${reportAuditEntry(entry)}`);
  }

  lines.push('');
  lines.push(
    `Summary: ${red(String(result.errorCount) + ' error(s)')}` +
    `  ${yellow(String(result.warnCount) + ' warning(s)')}` +
    `  ${dim(String(result.infoCount) + ' info(s)')}`
  );

  return lines.join('\n');
}

export function reportAuditSummary(result: AuditResult): string {
  if (result.errorCount > 0) {
    return red(`Audit failed: ${result.errorCount} error(s), ${result.warnCount} warning(s).`);
  }
  if (result.warnCount > 0) {
    return yellow(`Audit passed with ${result.warnCount} warning(s).`);
  }
  return green('Audit passed.');
}
