import { loadConfigs } from '../config/loader';
import { searchBothConfigs, SearchOptions } from '../config/search';
import { reportSearchResult, reportSearchSummary, reportSearchError } from '../output/search-reporter';
import { parseArgs } from './args';

export async function runSearchCmd(argv: string[]): Promise<void> {
  const args = parseArgs(argv);
  const query: string = (args['query'] as string) || (args._?.[0] as string) || '';

  if (!query) {
    console.error('Usage: stackdiff search <query> [--regex] [--case-sensitive] [--keys-only] [--values-only]');
    process.exit(1);
  }

  const opts: SearchOptions = {
    regex: Boolean(args['regex']),
    caseSensitive: Boolean(args['case-sensitive']),
    matchKeys: !args['values-only'],
    matchValues: !args['keys-only'],
  };

  try {
    const { staging, production } = await loadConfigs(args);
    const results = searchBothConfigs(staging, production, query, opts);

    reportSearchResult(results.staging, 'Staging');
    reportSearchResult(results.production, 'Production');

    if (!args['no-summary']) {
      reportSearchSummary(results.staging, results.production);
    }

    const hasMatches = results.staging.total > 0 || results.production.total > 0;
    process.exit(hasMatches ? 0 : 1);
  } catch (err) {
    reportSearchError(query, err);
    process.exit(2);
  }
}
