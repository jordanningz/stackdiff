import { parseArgs } from './args';
import { resolvePath, resolveMany, assertResolved } from '../config/resolve';
import {
  reportResolvedPaths,
  reportResolveSummary,
  reportResolveError,
} from '../output/resolve-reporter';

export async function runResolveCmd(argv: string[]): Promise<void> {
  const args = parseArgs(argv);

  const labels = ['staging', 'production'];
  const inputPaths = [
    args.staging ?? '.env.staging',
    args.production ?? '.env.production',
  ];

  const resolved = resolveMany(inputPaths, {
    basePath: args.basePath ?? process.cwd(),
    allowMissing: true,
  });

  const pairs = labels.map((label, i) => ({ label, resolved: resolved[i] }));

  reportResolvedPaths(pairs);
  reportResolveSummary(resolved);

  const missing = resolved.filter((r) => !r.exists);
  if (missing.length > 0) {
    for (const m of missing) {
      reportResolveError(m.absolute);
    }
    process.exit(1);
  }

  try {
    resolved.forEach(assertResolved);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    reportResolveError(message);
    process.exit(1);
  }
}
