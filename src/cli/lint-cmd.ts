import { loadConfigs } from '../config/loader';
import { lintConfig, lintBothConfigs } from '../config/lint';
import {
  reportLintResult,
  reportLintSummary,
  reportBothLintResults,
} from '../output/lint-reporter';
import { ParsedArgs } from './args';

export async function runLintCmd(args: ParsedArgs): Promise<void> {
  const { stagingFile, productionFile, both } = args;

  if (both && stagingFile && productionFile) {
    const { staging, production } = await loadConfigs(stagingFile, productionFile);
    const results = lintBothConfigs(staging, production);
    reportBothLintResults(results.staging, results.production);

    const hasErrors =
      results.staging.errorCount > 0 || results.production.errorCount > 0;
    if (hasErrors) process.exit(1);
    return;
  }

  const file = stagingFile ?? productionFile;
  if (!file) {
    console.error('Error: no config file specified.');
    process.exit(1);
  }

  const { staging } = await loadConfigs(file, file);
  const result = lintConfig(staging);
  reportLintResult(file, result);
  reportLintSummary(result);

  if (result.errorCount > 0) process.exit(1);
}
