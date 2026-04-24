import { filterConfig, filterBothConfigs, loadFilterOptionsFromEnv } from './filter';

const sample = {
  APP_NAME: 'myapp',
  APP_ENV: 'production',
  DB_HOST: 'localhost',
  DB_PORT: '5432',
  SECRET_KEY: 'abc123',
};

describe('filterConfig', () => {
  it('filters by explicit keys', () => {
    const result = filterConfig(sample, { keys: ['APP_NAME', 'DB_HOST'] });
    expect(result.filtered).toEqual({ APP_NAME: 'myapp', DB_HOST: 'localhost' });
    expect(result.included).toEqual(['APP_NAME', 'DB_HOST']);
    expect(result.excluded).toContain('SECRET_KEY');
  });

  it('filters by prefix', () => {
    const result = filterConfig(sample, { prefix: 'DB_' });
    expect(result.filtered).toEqual({ DB_HOST: 'localhost', DB_PORT: '5432' });
    expect(result.included).toHaveLength(2);
  });

  it('filters by regex', () => {
    const result = filterConfig(sample, { regex: /^APP_/ });
    expect(Object.keys(result.filtered)).toEqual(['APP_NAME', 'APP_ENV']);
  });

  it('filters by regex string', () => {
    const result = filterConfig(sample, { regex: '^SECRET' });
    expect(result.filtered).toEqual({ SECRET_KEY: 'abc123' });
  });

  it('inverts filter', () => {
    const result = filterConfig(sample, { prefix: 'DB_', invert: true });
    expect(result.filtered).not.toHaveProperty('DB_HOST');
    expect(result.filtered).toHaveProperty('APP_NAME');
  });

  it('returns all keys when no options given', () => {
    const result = filterConfig(sample, {});
    expect(result.included).toHaveLength(Object.keys(sample).length);
  });

  it('preserves original config', () => {
    const result = filterConfig(sample, { prefix: 'DB_' });
    expect(result.original).toBe(sample);
  });
});

describe('filterBothConfigs', () => {
  it('filters both configs with same options', () => {
    const prod = { DB_HOST: 'prod-db', APP_NAME: 'myapp' };
    const result = filterBothConfigs(sample, prod, { prefix: 'DB_' });
    expect(result.staging.filtered).toHaveProperty('DB_HOST');
    expect(result.production.filtered).toHaveProperty('DB_HOST');
    expect(result.production.filtered).not.toHaveProperty('APP_NAME');
  });
});

describe('loadFilterOptionsFromEnv', () => {
  it('loads keys from env', () => {
    process.env.STACKDIFF_FILTER_KEYS = 'APP_NAME, DB_HOST';
    const opts = loadFilterOptionsFromEnv();
    expect(opts.keys).toEqual(['APP_NAME', 'DB_HOST']);
    delete process.env.STACKDIFF_FILTER_KEYS;
  });

  it('loads invert flag from env', () => {
    process.env.STACKDIFF_FILTER_INVERT = 'true';
    const opts = loadFilterOptionsFromEnv();
    expect(opts.invert).toBe(true);
    delete process.env.STACKDIFF_FILTER_INVERT;
  });
});
