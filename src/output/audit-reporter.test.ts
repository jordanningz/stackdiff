import { reportAuditEntry, reportAuditResult, reportAuditSummary } from './audit-reporter';
import { AuditResult, AuditEntry } from '../config/audit';

const makeResult = (overrides: Partial<AuditResult> = {}): AuditResult => ({
  entries: [],
  errorCount: 0,
  warnCount: 0,
  infoCount: 0,
  ...overrides,
});

const errorEntry: AuditEntry = {
  key: 'DB_URL',
  severity: 'error',
  message: 'Required key "DB_URL" is missing',
  source: 'staging',
};

const warnEntry: AuditEntry = {
  key: 'API_KEY',
  severity: 'warn',
  message: 'Key "API_KEY" has an empty value',
  source: 'production',
};

describe('reportAuditEntry', () => {
  it('includes ERROR label for error severity', () => {
    expect(reportAuditEntry(errorEntry)).toContain('ERROR');
  });

  it('includes WARN label for warn severity', () => {
    expect(reportAuditEntry(warnEntry)).toContain('WARN');
  });

  it('includes the message text', () => {
    expect(reportAuditEntry(errorEntry)).toContain('Required key');
  });

  it('includes the source', () => {
    expect(reportAuditEntry(errorEntry)).toContain('staging');
  });
});

describe('reportAuditResult', () => {
  it('shows pass message when no entries', () => {
    expect(reportAuditResult(makeResult())).toContain('passed');
  });

  it('includes summary counts when there are issues', () => {
    const result = makeResult({ entries: [errorEntry], errorCount: 1 });
    expect(reportAuditResult(result)).toContain('1 error');
  });
});

describe('reportAuditSummary', () => {
  it('returns failed message on errors', () => {
    expect(reportAuditSummary(makeResult({ errorCount: 2, warnCount: 1 }))).toContain('failed');
  });

  it('returns warning message when only warnings', () => {
    expect(reportAuditSummary(makeResult({ warnCount: 3 }))).toContain('warning');
  });

  it('returns passed message when clean', () => {
    expect(reportAuditSummary(makeResult())).toContain('passed');
  });
});
