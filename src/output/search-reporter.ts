import { SearchResult } from '../config/search';
import { green, yellow, dim, bold } from './color';

export function reportSearchResult(result: SearchResult, label = 'Config'): void {
  console.log(bold(`\n${label} — search: "${result.query}"`) + dim(` (${result.total} match${result.total !== 1 ? 'es' : ''})`) );

  if (result.total === 0) {
    console.log(dim('  No matches found.'));
    return;
  }

  for (const match of result.matches) {
    const keyPart = match.matchedOn === 'key' || match.matchedOn === 'both'
      ? green(match.key)
      : dim(match.key);
    const valPart = match.matchedOn === 'value' || match.matchedOn === 'both'
      ? yellow(match.value)
      : dim(match.value);
    const tag = dim(`[${match.matchedOn}]`);
    console.log(`  ${keyPart}=${valPart} ${tag}`);
  }
}

export function reportSearchSummary(
  staging: SearchResult,
  production: SearchResult
): void {
  const stagingKeys = new Set(staging.matches.map(m => m.key));
  const prodKeys = new Set(production.matches.map(m => m.key));
  const onlyInStaging = staging.matches.filter(m => !prodKeys.has(m.key)).length;
  const onlyInProd = production.matches.filter(m => !stagingKeys.has(m.key)).length;

  console.log(bold('\nSearch Summary'));
  console.log(`  Staging matches:    ${staging.total}`);
  console.log(`  Production matches: ${production.total}`);
  if (onlyInStaging > 0) console.log(yellow(`  Only in staging:   ${onlyInStaging}`));
  if (onlyInProd > 0) console.log(yellow(`  Only in prod:      ${onlyInProd}`));
}

export function reportSearchError(query: string, err: unknown): void {
  const msg = err instanceof Error ? err.message : String(err);
  console.error(`Search failed for query "${query}": ${msg}`);
}
