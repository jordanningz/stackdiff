import { reportResolvedPath, reportResolvedPaths, reportResolveSummary, reportResolveError } from './resolve-reporter';
import { ResolvedPath } from '../config/resolve';

const mockResolved = (exists: boolean): ResolvedPath => ({
  absolute: '/project/.env',
  relative: '.env',
  exists,
  extension: '.env',
});

describe('reportResolvedPath', () => {
  it('logs a found path with checkmark', () => {
    const spy = jest.spyOn(console, 'log').mockImplementation();
    reportResolvedPath(mockResolved(true), 'staging');
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy.mock.calls[0][0]).toContain('.env');
    spy.mockRestore();
  });

  it('logs a missing path with X mark', () => {
    const spy = jest.spyOn(console, 'log').mockImplementation();
    reportResolvedPath(mockResolved(false));
    expect(spy).toHaveBeenCalledTimes(1);
    spy.mockRestore();
  });
});

describe('reportResolvedPaths', () => {
  it('logs header and each path', () => {
    const spy = jest.spyOn(console, 'log').mockImplementation();
    reportResolvedPaths([
      { label: 'staging', resolved: mockResolved(true) },
      { label: 'production', resolved: mockResolved(false) },
    ]);
    expect(spy).toHaveBeenCalledTimes(3);
    spy.mockRestore();
  });
});

describe('reportResolveSummary', () => {
  it('reports all resolved when none missing', () => {
    const spy = jest.spyOn(console, 'log').mockImplementation();
    reportResolveSummary([mockResolved(true), mockResolved(true)]);
    expect(spy.mock.calls[0][0]).toContain('successfully');
    spy.mockRestore();
  });

  it('reports missing count when some missing', () => {
    const spy = jest.spyOn(console, 'log').mockImplementation();
    reportResolveSummary([mockResolved(true), mockResolved(false)]);
    expect(spy.mock.calls[0][0]).toContain('missing');
    spy.mockRestore();
  });
});

describe('reportResolveError', () => {
  it('logs to stderr', () => {
    const spy = jest.spyOn(console, 'error').mockImplementation();
    reportResolveError('/bad/path');
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy.mock.calls[0][0]).toContain('/bad/path');
    spy.mockRestore();
  });
});
