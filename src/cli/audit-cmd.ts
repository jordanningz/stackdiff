import { loadConfigs } from '../config/loader';
import { auditBothConfigs } from '../config/audit';
import { reportAuditResult, reportAuditSummary } from '../output/audit-reporter';
import { ParsedArgs } from './args';

export async function runAuditCmd(args: ParsedArgs): Promise<void> {
  const { staging, production } = await loadConfigs(
    args.stagingFile,
    args.productionFile
  );

  const result = auditBothConfigs(staging, production);

  if (args.format === 'json') {
    console.log(JSON.stringify(result, null, 2));
    process.exitCode = result.errorCount > 0 ? 1 : 0;
    return;
  }

  console.log(reportAuditResult(result));

  if (args.summary) {
    console.log();
    console.log(reportAuditSummary(result));
  }

  if (result.errorCount > 0) {
    process.exitCode = 1;
  }
}
