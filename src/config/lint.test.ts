import { lintConfig, lintBothConfigs } from './lint';

describe('lintConfig', () => {
  it('returns no entries for a clean config', () => {
    const result = lintConfig({ DATABASE_URL: 'postgres://host/db', PORT: '3000' });
    expect(result.entries).toHaveLength(0);
    expect(result.errorCount).toBe(0);
  });

  it('warns on empty value', () => {
    const result = lintConfig({ API_KEY: '' });
    const entry = result.entries.find((e) => e.rule === 'no-empty-value');
    expect(entry).toBeDefined();
    expect(entry?.severity).toBe('warn');
  });

  it('warns on lowercase key', () => {
    const result = lintConfig({ apiKey: 'abc123' });
    const entry = result.entries.find((e) => e.rule === 'uppercase-key');
    expect(entry).toBeDefined();
  });

  it('errors on URL with embedded credentials', () => {
    const result = lintConfig({ DB: 'postgres://user:pass@host/db' });
    const entry = result.entries.find((e) => e.rule === 'no-url-with-credentials');
    expect(entry).toBeDefined();
    expect(entry?.severity).toBe('error');
    expect(result.errorCount).toBe(1);
  });

  it('warns on localhost reference', () => {
    const result = lintConfig({ API_URL: 'http://localhost:4000' });
    const entry = result.entries.find((e) => e.rule === 'no-localhost-in-value');
    expect(entry).toBeDefined();
    expect(entry?.severity).toBe('warn');
  });

  it('reports info on trailing whitespace', () => {
    const result = lintConfig({ NAME: 'value  ' });
    const entry = result.entries.find((e) => e.rule === 'no-trailing-whitespace');
    expect(entry).toBeDefined();
    expect(entry?.severity).toBe('info');
  });

  it('applies extra custom rules', () => {
    const customRule = {
      name: 'no-test-values',
      severity: 'warn' as const,
      check: (_: string, v: string) => v === 'test' ? 'Value is "test"' : null,
    };
    const result = lintConfig({ FOO: 'test' }, [customRule]);
    expect(result.entries.find((e) => e.rule === 'no-test-values')).toBeDefined();
  });

  it('counts correctly across severities', () => {
    const result = lintConfig({ db: 'postgres://u:p@host/db', API_URL: 'http://localhost' });
    expect(result.errorCount).toBeGreaterThanOrEqual(1);
    expect(result.warnCount).toBeGreaterThanOrEqual(1);
  });
});

describe('lintBothConfigs', () => {
  it('returns results for both configs', () => {
    const result = lintBothConfigs({ KEY: 'val' }, { KEY: '' });
    expect(result.staging).toBeDefined();
    expect(result.production.warnCount).toBeGreaterThan(0);
  });
});
