import { Command } from 'commander';

export interface CliOptions {
  staging: string;
  production: string;
  format: 'table' | 'json' | 'dotenv';
  filter: 'all' | 'changed' | 'added' | 'removed';
  color: boolean;
  summary: boolean;
}

export function parseArgs(argv: string[] = process.argv): CliOptions {
  const program = new Command();

  program
    .name('stackdiff')
    .description('Compare environment configs across staging and production deployments')
    .version('1.0.0')
    .requiredOption('-s, --staging <path>', 'Path to staging env file')
    .requiredOption('-p, --production <path>', 'Path to production env file')
    .option('-f, --format <type>', 'Output format: table, json, dotenv', 'table')
    .option('--filter <type>', 'Filter results: all, changed, added, removed', 'all')
    .option('--no-color', 'Disable colored output')
    .option('--summary', 'Print summary after diff', false);

  program.parse(argv);

  const opts = program.opts();

  return {
    staging: opts.staging,
    production: opts.production,
    format: opts.format as CliOptions['format'],
    filter: opts.filter as CliOptions['filter'],
    color: opts.color !== false,
    summary: opts.summary,
  };
}
