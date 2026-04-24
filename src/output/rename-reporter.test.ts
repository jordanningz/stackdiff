import { reportRenameResult, reportRenameSummary, reportRenameError } from './rename-reporter';
import { RenameResult } from '../config/rename';

const mockLog = jest.spyOn(console, 'log').mockImplementation(() => {});
const mockError = jest.spyOn(console, 'error').mockImplementation(() => {});

beforeEach(() => {
  mockLog.mockClear();
  mockError.mockClear();
});

afterAll(() => {
  mockLog.mockRestore();
  mockError.mockRestore();
});

const makeResult = (overrides: Partial<RenameResult> = {}): RenameResult => ({
  config: { API_URL: 'https://api.example.com' },
  renamed: [{ from: 'OLD_API_URL', to: 'API_URL' }],
  notFound: [],
  ...overrides,
});

describe('reportRenameResult', () => {
  it('prints renamed keys', () => {
    reportRenameResult(makeResult(), 'Staging');
    const output = mockLog.mock.calls.map(c => c.join(' ')).join('\n');
    expect(output).toContain('OLD_API_URL');
    expect(output).toContain('API_URL');
  });

  it('prints no renames message when empty', () => {
    reportRenameResult(makeResult({ renamed: [], notFound: [] }), 'Staging');
    const output = mockLog.mock.calls.map(c => c.join(' ')).join('\n');
    expect(output).toContain('No renames applied');
  });

  it('prints not-found keys in verbose mode', () => {
    reportRenameResult(makeResult({ notFound: ['GHOST_KEY'] }), 'Staging', true);
    const output = mockLog.mock.calls.map(c => c.join(' ')).join('\n');
    expect(output).toContain('GHOST_KEY');
  });

  it('does not print not-found keys when verbose is false', () => {
    reportRenameResult(makeResult({ notFound: ['GHOST_KEY'] }), 'Staging', false);
    const output = mockLog.mock.calls.map(c => c.join(' ')).join('\n');
    expect(output).not.toContain('GHOST_KEY');
  });
});

describe('reportRenameSummary', () => {
  it('reports total renamed count', () => {
    reportRenameSummary(makeResult(), makeResult());
    const output = mockLog.mock.calls.map(c => c.join(' ')).join('\n');
    expect(output).toContain('2');
    expect(output).toContain('renamed');
  });

  it('reports missing keys when present', () => {
    reportRenameSummary(makeResult({ notFound: ['X'] }), makeResult({ notFound: ['Y'] }));
    const output = mockLog.mock.calls.map(c => c.join(' ')).join('\n');
    expect(output).toContain('2');
    expect(output).toContain('not found');
  });
});

describe('reportRenameError', () => {
  it('logs an error message', () => {
    reportRenameError('invalid rename map');
    expect(mockError).toHaveBeenCalledWith(expect.stringContaining('invalid rename map'));
  });
});
