import { reportSearchResult, reportSearchSummary, reportSearchError } from './search-reporter';
import { SearchResult } from '../config/search';

const makeResult = (overrides: Partial<SearchResult> = {}): SearchResult => ({
  query: 'REDIS',
  total: 2,
  matches: [
    { key: 'REDIS_HOST', value: 'localhost', matchedOn: 'key' },
    { key: 'REDIS_PORT', value: '6379', matchedOn: 'key' },
  ],
  ...overrides,
});

describe('reportSearchResult', () => {
  it('prints matches without throwing', () => {
    expect(() => reportSearchResult(makeResult())).not.toThrow();
  });

  it('prints no-match message when total is 0', () => {
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
    reportSearchResult(makeResult({ total: 0, matches: [] }));
    const output = spy.mock.calls.map(c => c.join(' ')).join('\n');
    expect(output).toMatch(/No matches/);
    spy.mockRestore();
  });

  it('uses provided label', () => {
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
    reportSearchResult(makeResult(), 'Staging');
    const output = spy.mock.calls.map(c => c.join(' ')).join('\n');
    expect(output).toMatch(/Staging/);
    spy.mockRestore();
  });
});

describe('reportSearchSummary', () => {
  it('prints summary without throwing', () => {
    const r = makeResult();
    expect(() => reportSearchSummary(r, r)).not.toThrow();
  });

  it('highlights keys unique to staging', () => {
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
    const staging = makeResult();
    const prod = makeResult({ total: 0, matches: [] });
    reportSearchSummary(staging, prod);
    const output = spy.mock.calls.map(c => c.join(' ')).join('\n');
    expect(output).toMatch(/Only in staging/);
    spy.mockRestore();
  });
});

describe('reportSearchError', () => {
  it('prints error message', () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    reportSearchError('REDIS', new Error('bad regex'));
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('bad regex'));
    spy.mockRestore();
  });
});
