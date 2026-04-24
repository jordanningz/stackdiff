import { reportGroupResult, reportGroupSummary } from './group-reporter';

const mockResult = {
  groups: {
    DB: { HOST: 'localhost', PORT: '5432' },
    REDIS: { URL: 'redis://localhost' },
  },
  ungrouped: { PORT: '8080' },
};

describe('reportGroupResult', () => {
  let spy: jest.SpyInstance;
  beforeEach(() => { spy = jest.spyOn(console, 'log').mockImplementation(() => {}); });
  afterEach(() => { spy.mockRestore(); });

  it('prints group count and prefix names', () => {
    reportGroupResult('staging', mockResult);
    const output = spy.mock.calls.map(c => c[0]).join('\n');
    expect(output).toContain('Groups (2)');
    expect(output).toContain('DB');
    expect(output).toContain('REDIS');
  });

  it('shows ungrouped count', () => {
    reportGroupResult('staging', mockResult);
    const output = spy.mock.calls.map(c => c[0]).join('\n');
    expect(output).toContain('ungrouped');
    expect(output).toContain('1 key');
  });

  it('shows key values in verbose mode', () => {
    reportGroupResult('staging', mockResult, true);
    const output = spy.mock.calls.map(c => c[0]).join('\n');
    expect(output).toContain('DB_HOST');
    expect(output).toContain('localhost');
    expect(output).toContain('PORT = 8080');
  });

  it('handles no groups gracefully', () => {
    reportGroupResult('staging', { groups: {}, ungrouped: {} });
    const output = spy.mock.calls.map(c => c[0]).join('\n');
    expect(output).toContain('No groups found');
  });
});

describe('reportGroupSummary', () => {
  let spy: jest.SpyInstance;
  beforeEach(() => { spy = jest.spyOn(console, 'log').mockImplementation(() => {}); });
  afterEach(() => { spy.mockRestore(); });

  it('prints staging and production group counts', () => {
    const prod = { groups: { DB: { HOST: 'prod' }, S3: { BUCKET: 'b' } }, ungrouped: {} };
    reportGroupSummary(mockResult, prod);
    const output = spy.mock.calls.map(c => c[0]).join('\n');
    expect(output).toContain('Staging groups');
    expect(output).toContain('Production groups');
  });

  it('shows prefixes only in staging or production', () => {
    const prod = { groups: { S3: { BUCKET: 'b' } }, ungrouped: {} };
    reportGroupSummary(mockResult, prod);
    const output = spy.mock.calls.map(c => c[0]).join('\n');
    expect(output).toContain('Only in staging');
    expect(output).toContain('Only in prod');
  });
});
