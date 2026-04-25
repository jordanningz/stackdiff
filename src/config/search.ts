import { EnvConfig } from './loader';

export interface SearchOptions {
  caseSensitive?: boolean;
  matchKeys?: boolean;
  matchValues?: boolean;
  regex?: boolean;
}

export interface SearchMatch {
  key: string;
  value: string;
  matchedOn: 'key' | 'value' | 'both';
}

export interface SearchResult {
  matches: SearchMatch[];
  total: number;
  query: string;
}

export function searchConfig(
  config: EnvConfig,
  query: string,
  opts: SearchOptions = {}
): SearchResult {
  const { caseSensitive = false, matchKeys = true, matchValues = true, regex = false } = opts;

  const test = (str: string): boolean => {
    if (regex) {
      const flags = caseSensitive ? '' : 'i';
      return new RegExp(query, flags).test(str);
    }
    const a = caseSensitive ? str : str.toLowerCase();
    const b = caseSensitive ? query : query.toLowerCase();
    return a.includes(b);
  };

  const matches: SearchMatch[] = [];

  for (const [key, value] of Object.entries(config)) {
    const keyMatch = matchKeys && test(key);
    const valMatch = matchValues && test(value);
    if (keyMatch && valMatch) {
      matches.push({ key, value, matchedOn: 'both' });
    } else if (keyMatch) {
      matches.push({ key, value, matchedOn: 'key' });
    } else if (valMatch) {
      matches.push({ key, value, matchedOn: 'value' });
    }
  }

  return { matches, total: matches.length, query };
}

export function searchBothConfigs(
  staging: EnvConfig,
  production: EnvConfig,
  query: string,
  opts: SearchOptions = {}
): { staging: SearchResult; production: SearchResult } {
  return {
    staging: searchConfig(staging, query, opts),
    production: searchConfig(production, query, opts),
  };
}
