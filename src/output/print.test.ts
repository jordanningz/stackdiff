import { printDiff, printSummary, filterChanged } from './print';
import type { DiffEntry } from './formatter';

const entries: DiffEntry[] = [
  { key: 'API_URL', staging: 'https://staging.api.com', production: 'https://api.com', status: 'changed' },
  { key: 'DEBUG', staging: 'true', production: undefined, status: 'removed' },
  { key: 'APP_NAME', staging: 'myapp', production: 'myapp', status: 'unchanged' },
];

describe('filterChanged', () => {
  it('excludes unchanged entries', () => {
    const result = filterChanged(entries);
    expect(result).toHaveLength(2);
    expect(result.every(e => e.status !== 'unchanged')).toBe(true);
  });
});

describe('printDiff', () => {
  it('returns no-diff message when empty', () => {
    const result = printDiff([], { format: 'table', color: false });
    expect(result).toBe('No differences found.');
  });

  it('renders table format', () => {
    const result = printDiff(entries, { format: 'table', color: false });
    expect(result).toContain('API_URL');
  });

  it('renders json format', () => {
    const result = printDiff(entries, { format: 'json', color: false });
    expect(() => JSON.parse(result)).not.toThrow();
  });

  it('filters to only changed when onlyChanged=true', () => {
    const result = printDiff(entries, { format: 'json', color: false, onlyChanged: true });
    const parsed = JSON.parse(result);
    expect(parsed).toHaveLength(2);
  });
});

describe('printSummary', () => {
  it('includes counts for each status', () => {
    const result = printSummary(entries);
    expect(result).toContain('1 changed');
    expect(result).toContain('1 removed');
    expect(result).toContain('1 unchanged');
  });

  it('returns no differences for empty', () => {
    const result = printSummary([]);
    expect(result).toContain('no differences');
  });
});
