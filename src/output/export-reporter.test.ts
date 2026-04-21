import { reportExportResult, reportExportBoth, reportExportError } from './export-reporter';
import { ExportResult } from '../config/export';

const makeResult = (overrides: Partial<ExportResult> = {}): ExportResult => ({
  outputPath: '/tmp/out.json',
  format: 'json',
  bytesWritten: 1024,
  keyCount: 5,
  ...overrides,
});

describe('reportExportResult', () => {
  it('logs export info without throwing', () => {
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
    reportExportResult(makeResult());
    expect(spy).toHaveBeenCalledTimes(1);
    const output = spy.mock.calls[0][0] as string;
    expect(output).toContain('5 keys');
    expect(output).toContain('/tmp/out.json');
    spy.mockRestore();
  });

  it('includes format in output', () => {
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
    reportExportResult(makeResult({ format: 'dotenv' }));
    expect(spy.mock.calls[0][0]).toContain('dotenv');
    spy.mockRestore();
  });
});

describe('reportExportBoth', () => {
  it('logs header and both results', () => {
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
    reportExportBoth(
      makeResult({ outputPath: '/tmp/staging.env', keyCount: 4 }),
      makeResult({ outputPath: '/tmp/production.env', keyCount: 6 })
    );
    expect(spy).toHaveBeenCalledTimes(4);
    const allOutput = spy.mock.calls.map((c) => c[0] as string).join(' ');
    expect(allOutput).toContain('staging.env');
    expect(allOutput).toContain('production.env');
    expect(allOutput).toContain('10 keys');
    spy.mockRestore();
  });
});

describe('reportExportError', () => {
  it('logs error message', () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    reportExportError('/tmp/out.json', new Error('permission denied'));
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy.mock.calls[0][0]).toContain('permission denied');
    spy.mockRestore();
  });
});
