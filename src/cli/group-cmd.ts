import { loadConfigs } from '../config/loader';
import { groupBothConfigs, listPrefixes } from '../config/group';
import { reportGroupResult, reportGroupSummary } from '../output/group-reporter';
import { parseArgs } from './args';

export async function runGroupCmd(argv: string[]): Promise<void> {
  const args = parseArgs(argv);
  const { staging, production } = await loadConfigs(
    args.staging,
    args.production
  );

  const delimiter = (args as Record<string, string>)['delimiter'] ?? '_';
  const verbose = Boolean((args as Record<string, unknown>)['verbose']);
  const listOnly = Boolean((args as Record<string, unknown>)['list']);

  if (listOnly) {
    const stagingPrefixes = listPrefixes(staging, delimiter);
    const prodPrefixes = listPrefixes(production, delimiter);
    console.log('Staging prefixes:   ', stagingPrefixes.join(', ') || '(none)');
    console.log('Production prefixes:', prodPrefixes.join(', ') || '(none)');
    return;
  }

  const { staging: stagingGroups, production: prodGroups } = groupBothConfigs(
    staging,
    production,
    { delimiter, lowercase: false }
  );

  reportGroupResult('staging', stagingGroups, verbose);
  reportGroupResult('production', prodGroups, verbose);
  reportGroupSummary(stagingGroups, prodGroups);
}
