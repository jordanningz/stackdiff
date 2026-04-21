import { reportRedactResult, reportRedactSummary, reportRedactError } from './redact-reporter';

const mockResult = (keys: string[]) => ({
  config: {},
  redactedKeys: keys,
});

describe('reportRedactResult', () => {
  let spy: jest.SpyInstance;

  beforeEach(() => {
    spy = jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => spy.mockRestore());

  it('prints success when no keys redacted', () => {
    reportRedactResult('staging', mockResult([]));
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('no sensitive keys found'));
  });

  it('prints warning when keys are redacted', () => {
    reportRedactResult('production', mockResult(['API_KEY', 'DB_PASSWORD']));
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('2 key(s) redacted'));
  });

  it('lists keys in verbose mode', () => {
    reportRedactResult('staging', mockResult(['API_KEY']), true);
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('API_KEY'));
  });

  it('does not list keys when not verbose', () => {
    reportRedactResult('staging', mockResult(['API_KEY']), false);
    const calls = spy.mock.calls.map((c) => c[0]);
    expect(calls.some((c) => c.includes('API_KEY'))).toBe(false);
  });
});

describe('reportRedactSummary', () => {
  let spy: jest.SpyInstance;

  beforeEach(() => {
    spy = jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => spy.mockRestore());

  it('prints summary with correct counts', () => {
    reportRedactSummary(
      mockResult(['API_KEY', 'SECRET']),
      mockResult(['API_KEY', 'TOKEN'])
    );
    const output = spy.mock.calls.map((c) => c[0]).join('\n');
    expect(output).toContain('2');
    expect(output).toContain('Redact Summary');
  });

  it('counts unique keys across both configs', () => {
    reportRedactSummary(mockResult(['A', 'B']), mockResult(['B', 'C']));
    const output = spy.mock.calls.map((c) => c[0]).join('\n');
    expect(output).toContain('3');
  });
});

describe('reportRedactError', () => {
  it('logs to stderr', () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    reportRedactError('something went wrong');
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('something went wrong'));
    spy.mockRestore();
  });
});
