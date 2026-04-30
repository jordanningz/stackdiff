import { detectEnvType, detectBothEnvTypes } from './env-type';

describe('detectEnvType', () => {
  it('detects production from NODE_ENV value', () => {
    const result = detectEnvType({ NODE_ENV: 'production', API_URL: 'https://api.example.com' });
    expect(result.category).toBe('production');
    expect(result.confidence).toBeGreaterThan(0);
    expect(result.signals.length).toBeGreaterThan(0);
  });

  it('detects staging from key name', () => {
    const result = detectEnvType({ STAGING_DB_URL: 'postgres://db', NODE_ENV: 'staging' });
    expect(result.category).toBe('staging');
  });

  it('detects development from localhost value', () => {
    const result = detectEnvType({ API_URL: 'http://localhost:3000', NODE_ENV: 'development' });
    expect(result.category).toBe('development');
  });

  it('detects test environment', () => {
    const result = detectEnvType({ NODE_ENV: 'test', CI: 'true' });
    expect(result.category).toBe('test');
  });

  it('returns unknown for empty config', () => {
    const result = detectEnvType({});
    expect(result.category).toBe('unknown');
    expect(result.confidence).toBe(0);
    expect(result.signals).toEqual([]);
  });

  it('returns unknown for neutral config', () => {
    const result = detectEnvType({ PORT: '8080', TIMEOUT: '30' });
    expect(result.category).toBe('unknown');
  });

  it('confidence is between 0 and 1', () => {
    const result = detectEnvType({ NODE_ENV: 'production', DB: 'prod-db' });
    expect(result.confidence).toBeGreaterThanOrEqual(0);
    expect(result.confidence).toBeLessThanOrEqual(1);
  });

  it('detects UAT as staging', () => {
    const result = detectEnvType({ ENVIRONMENT: 'uat', DB_HOST: 'uat-db.internal' });
    expect(result.category).toBe('staging');
  });
});

describe('detectBothEnvTypes', () => {
  it('returns results for both envs', () => {
    const result = detectBothEnvTypes(
      { NODE_ENV: 'staging' },
      { NODE_ENV: 'production' }
    );
    expect(result.staging.category).toBe('staging');
    expect(result.production.category).toBe('production');
  });

  it('handles both unknown', () => {
    const result = detectBothEnvTypes({}, {});
    expect(result.staging.category).toBe('unknown');
    expect(result.production.category).toBe('unknown');
  });
});
