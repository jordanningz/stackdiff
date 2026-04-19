import { parseArgs, CliOptions } from './args';
import { loadConfigs } from '../config/loader';
import { diffConfigs, filterDiff } from '../config/diff';
import { formatOutput } from '../output/formatter';
import { printDiff, printSummary } from '../output/print';

export async function run(argv?: string[]): Promise<void> {
  let opts: CliOptions;

  try {
    opts = parseArgs(argv);
  } catch (err: any) {
    console.error(`Error parsing arguments: ${err.message}`);
    process.exit(1);
  }

  let configs;
  try {
    configs = await loadConfigs(opts.staging, opts.production);
  } catch (err: any) {
    console.error(`Error loading config files: ${err.message}`);
    process.exit(1);
  }

  const diff = diffConfigs(configs.staging, configs.production);
  const filtered = filterDiff(diff, opts.filter);

  if (filtered.length === 0) {
    console.log('No differences found.');
    return;
  }

  const output = formatOutput(filtered, opts.format, { color: opts.color });
  printDiff(output);

  if (opts.summary) {
    printSummary(diff);
  }
}
