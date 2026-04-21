import { reportLintEntry, reportLintResult, reportLintSummary, reportBothLintResults } from './lint-reporter';
import { LintResult } from '../config/lint';

const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

afterEach(() => consoleSpy.mockClear());
afterAll(() => consoleSpy.mockRestore());

const emptyResult: LintResult = { entries: [], errorCount: 0, warnCount: 0, infoCount: 0 };

const fullResult: LintResult = {
  entries: [
    { key: 'DB', rule: 'no-url-with-credentials', severity: 'error', message: 'Key "DB" contains a URL with embedded credentials' },
    { key: 'api_key', rule: 'uppercase-key', severity: 'warn', message: 'Key "api_key" should be uppercase' },
    { key: 'NAME', rule: 'no-trailing-whitespace', severity: 'info', message: 'Key "NAME" has trailing whitespace' },
  ],
  errorCount: 1,
  warnCount: 1,
  infoCount: 1,
};

describe('reportLintEntry', () => {
  it('logs an entry line', () => {
    reportLintEntry(fullResult.entries[0]);
    expect(consoleSpy).toHaveBeenCalledTimes(1);
  });
});

describe('reportLintResult', () => {
  it('shows success message for empty result', () => {
    reportLintResult('Staging:', emptyResult);
    const output = consoleSpy.mock.calls.map((c) => c[0]).join(' ');
    expect(output).toMatch(/No lint issues/);
  });

  it('logs each entry for a non-empty result', () => {
    reportLintResult('Production:', fullResult);
    expect(consoleSpy).toHaveBeenCalledTimes(fullResult.entries.length + 1);
  });
});

describe('reportLintSummary', () => {
  it('prints passed message when no issues', () => {
    reportLintSummary(emptyResult);
    const output = consoleSpy.mock.calls.map((c) => c[0]).join(' ');
    expect(output).toMatch(/no issues/);
  });

  it('prints counts when issues exist', () => {
    reportLintSummary(fullResult);
    const output = consoleSpy.mock.calls.map((c) => c[0]).join(' ');
    expect(output).toMatch(/error/);
    expect(output).toMatch(/warning/);
  });
});

describe('reportBothLintResults', () => {
  it('reports both and prints combined summary', () => {
    reportBothLintResults(emptyResult, fullResult);
    expect(consoleSpy.mock.calls.length).toBeGreaterThan(2);
  });
});
