import { auditConfig, auditBothConfigs } from './audit';

describe('auditConfig', () => {
  it('returns empty entries for clean config', () => {
    const result = auditConfig({ DATABASE_URL: 'postgres://localhost/db' }, 'staging');
    expect(result).toEqual([]);
  });

  it('warns on empty values', () => {
    const result = auditConfig({ API_KEY: '' }, 'production');
    expect(result).toHaveLength(1);
    expect(result[0].severity).toBe('warn');
    expect(result[0].key).toBe('API_KEY');
    expect(result[0].source).toBe('production');
  });

  it('warns on suspiciously short sensitive key values', () => {
    const result = auditConfig({ SECRET_TOKEN: 'abc' }, 'staging');
    expect(result.some((e) => e.key === 'SECRET_TOKEN' && e.severity === 'warn')).toBe(true);
  });

  it('does not warn on adequately long sensitive key values', () => {
    const result = auditConfig({ SECRET_TOKEN: 'a-very-long-secret-value' }, 'staging');
    expect(result.filter((e) => e.key === 'SECRET_TOKEN')).toHaveLength(0);
  });
});

describe('auditBothConfigs', () => {
  it('aggregates entries from both configs', () => {
    const staging = { API_KEY: '' };
    const production = { SECRET_TOKEN: 'x' };
    const result = auditBothConfigs(staging, production);
    expect(result.entries.length).toBeGreaterThanOrEqual(2);
  });

  it('counts severities correctly', () => {
    const staging = { API_KEY: '' };
    const production = { DB_URL: '' };
    const result = auditBothConfigs(staging, production);
    expect(result.warnCount).toBe(2);
    expect(result.errorCount).toBe(0);
  });

  it('returns zero counts for clean configs', () => {
    const result = auditBothConfigs({ FOO: 'bar' }, { FOO: 'baz' });
    expect(result.errorCount).toBe(0);
    expect(result.warnCount).toBe(0);
  });
});
