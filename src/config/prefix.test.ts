import { prefixConfig, prefixBothConfigs, loadPrefixOptionsFromEnv } from './prefix';

const sample = { APP_HOST: 'localhost', APP_PORT: '3000', DEBUG: 'true' };

describe('prefixConfig', () => {
  it('adds a prefix to all keys', () => {
    const result = prefixConfig(sample, { add: 'PROD_' });
    expect(result.transformed).toEqual({
      PROD_APP_HOST: 'localhost',
      PROD_APP_PORT: '3000',
      PROD_DEBUG: 'true',
    });
    expect(result.changed).toHaveLength(3);
    expect(result.skipped).toHaveLength(0);
  });

  it('removes a prefix from matching keys', () => {
    const result = prefixConfig(sample, { remove: 'APP_' });
    expect(result.transformed).toMatchObject({
      HOST: 'localhost',
      PORT: '3000',
      DEBUG: 'true',
    });
    expect(result.changed).toEqual(['APP_HOST', 'APP_PORT']);
    expect(result.skipped).toEqual(['DEBUG']);
  });

  it('replaces a prefix on matching keys', () => {
    const result = prefixConfig(sample, { replace: { from: 'APP_', to: 'SVC_' } });
    expect(result.transformed).toMatchObject({
      SVC_HOST: 'localhost',
      SVC_PORT: '3000',
      DEBUG: 'true',
    });
    expect(result.changed).toEqual(['APP_HOST', 'APP_PORT']);
    expect(result.skipped).toEqual(['DEBUG']);
  });

  it('returns original unchanged when no opts match', () => {
    const result = prefixConfig(sample, { remove: 'NOPE_' });
    expect(result.changed).toHaveLength(0);
    expect(result.skipped).toHaveLength(3);
    expect(result.transformed).toEqual(sample);
  });
});

describe('prefixBothConfigs', () => {
  it('applies prefix to both configs', () => {
    const { staging, production } = prefixBothConfigs(sample, sample, { add: 'X_' });
    expect(Object.keys(staging.transformed)).toContain('X_APP_HOST');
    expect(Object.keys(production.transformed)).toContain('X_APP_HOST');
  });
});

describe('loadPrefixOptionsFromEnv', () => {
  afterEach(() => {
    delete process.env.STACKDIFF_PREFIX_ADD;
    delete process.env.STACKDIFF_PREFIX_REMOVE;
    delete process.env.STACKDIFF_PREFIX_REPLACE_FROM;
    delete process.env.STACKDIFF_PREFIX_REPLACE_TO;
  });

  it('loads add option from env', () => {
    process.env.STACKDIFF_PREFIX_ADD = 'PROD_';
    expect(loadPrefixOptionsFromEnv()).toEqual({ add: 'PROD_' });
  });

  it('loads remove option from env', () => {
    process.env.STACKDIFF_PREFIX_REMOVE = 'DEV_';
    expect(loadPrefixOptionsFromEnv()).toEqual({ remove: 'DEV_' });
  });

  it('returns empty object when no env vars set', () => {
    expect(loadPrefixOptionsFromEnv()).toEqual({});
  });
});
