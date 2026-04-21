import { LintResult, LintEntry, LintSeverity } from '../config/lint';
import { red, yellow, dim, green } from './color';

function severityLabel(severity: LintSeverity): string {
  switch (severity) {
    case 'error': return red('error');
    case 'warn':  return yellow('warn ');
    case 'info':  return dim('info ');
  }
}

export function reportLintEntry(entry: LintEntry): void {
  console.log(
    `  ${severityLabel(entry.severity)}  ${entry.message}  ${dim(`[${entry.rule}]`)}`
  );
}

export function reportLintResult(label: string, result: LintResult): void {
  console.log(`\n${label}`);
  if (result.entries.length === 0) {
    console.log(green('  ✔ No lint issues found'));
    return;
  }
  for (const entry of result.entries) {
    reportLintEntry(entry);
  }
}

export function reportLintSummary(result: LintResult): void {
  const parts: string[] = [];
  if (result.errorCount > 0) parts.push(red(`${result.errorCount} error(s)`));
  if (result.warnCount > 0)  parts.push(yellow(`${result.warnCount} warning(s)`));
  if (result.infoCount > 0)  parts.push(dim(`${result.infoCount} info(s)`));
  if (parts.length === 0) {
    console.log(green('\nLint passed with no issues.'));
  } else {
    console.log(`\nLint summary: ${parts.join(', ')}`);
  }
}

export function reportBothLintResults(
  stagingResult: LintResult,
  productionResult: LintResult
): void {
  reportLintResult('Staging:', stagingResult);
  reportLintResult('Production:', productionResult);

  const totalErrors = stagingResult.errorCount + productionResult.errorCount;
  const totalWarns  = stagingResult.warnCount  + productionResult.warnCount;
  const totalInfos  = stagingResult.infoCount  + productionResult.infoCount;

  reportLintSummary({
    entries: [],
    errorCount: totalErrors,
    warnCount: totalWarns,
    infoCount: totalInfos,
  });
}
