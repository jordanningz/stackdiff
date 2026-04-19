import { formatTable, formatJson, formatDotenv, DiffEntry } from './formatter';

const sampleEntries: DiffEntry[] = [
  { key: 'API_URL', staging: 'https://staging.api.com', production: 'https://api.com', status: 'changed' },
  { key: 'DEBUG', staging: 'true', production: undefined, status: 'removed' },
  { key: 'LOG_LEVEL', staging: undefined, production: 'warn', status: 'added' },
  { key: 'APP_NAME', staging: 'myapp', production: 'myapp', status: 'unchanged' },
];

describe('formatTable', () => {
  it('includes all keys', () => {
    const output = formatTable(sampleEntries);
    expect(output).toContain('API_URL');
    expect(output).toContain('DEBUG');
    expect(output).toContain('LOG_LEVEL');
  });

  it('marks changed entries with ~', () => {
    const output = formatTable(sampleEntries);
    expect(output).toContain('~');
  });

  it('marks removed entries with -', () => {
    const output = formatTable(sampleEntries);
    expect(output).toContain('-');
  });

  it('marks added entries with +', () => {
    const output = formatTable(sampleEntries);
    expect(output).toContain('+');
  });
});

describe('formatJson', () => {
  it('returns valid JSON', () => {
    const output = formatJson(sampleEntries);
    expect(() => JSON.parse(output)).not.toThrow();
  });

  it('contains all entries', () => {
    const parsed = JSON.parse(formatJson(sampleEntries));
    expect(parsed).toHaveLength(4);
  });
});

describe('formatDotenv', () => {
  it('formats staging values', () => {
    const output = formatDotenv(sampleEntries, 'staging');
    expect(output).toContain('API_URL=https://staging.api.com');
    expect(output).not.toContain('LOG_LEVEL');
  });

  it('formats production values', () => {
    const output = formatDotenv(sampleEntries, 'production');
    expect(output).toContain('API_URL=https://api.com');
    expect(output).not.toContain('DEBUG');
  });
});
