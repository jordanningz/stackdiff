import { truncateValue, truncateConfig, truncateBothConfigs, loadTruncateOptionsFromEnv } from './truncate';

describe('truncateValue', () => {
  it('returns value unchanged when within maxLength', () => {
    expect(truncateValue('hello', 10)).toBe('hello');
  });

  it('truncates value exceeding maxLength with default suffix', () => {
    expect(truncateValue('hello world', 8)).toBe('hello...');
  });

  it('uses custom suffix', () => {
    expect(truncateValue('abcdefgh', 5, '--')).toBe('abc--');
  });

  it('handles maxLength shorter than suffix gracefully', () => {
    const result = truncateValue('hello', 2, '...');
    expect(result.length).toBeLessThanOrEqual(2);
  });
});

describe('truncateConfig', () => {
  const config = {
    SHORT: 'hi',
    LONG_VAL: 'this is a very long environment variable value',
    ANOTHER: 'medium length value here',
  };

  it('truncates values exceeding maxLength', () => {
    const { config: result, truncated } = truncateConfig(config, { maxLength: 10 });
    expect(result.SHORT).toBe('hi');
    expect(result.LONG_VAL.length).toBeLessThanOrEqual(10);
    expect(truncated).toHaveProperty('LONG_VAL');
    expect(truncated.LONG_VAL.original).toBe(config.LONG_VAL);
  });

  it('only truncates specified keys when keys option provided', () => {
    const { config: result, truncated } = truncateConfig(config, { maxLength: 10, keys: ['SHORT'] });
    expect(result.LONG_VAL).toBe(config.LONG_VAL);
    expect(Object.keys(truncated)).not.toContain('LONG_VAL');
  });

  it('returns empty truncated map when nothing exceeds maxLength', () => {
    const { truncated } = truncateConfig({ A: 'x' }, { maxLength: 100 });
    expect(Object.keys(truncated)).toHaveLength(0);
  });
});

describe('truncateBothConfigs', () => {
  it('truncates staging and production independently', () => {
    const staging = { KEY: 'short' };
    const production = { KEY: 'a very long production value that exceeds limit' };
    const result = truncateBothConfigs(staging, production, { maxLength: 10 });
    expect(result.staging.config.KEY).toBe('short');
    expect(result.production.config.KEY.length).toBeLessThanOrEqual(10);
    expect(Object.keys(result.staging.truncated)).toHaveLength(0);
    expect(result.production.truncated).toHaveProperty('KEY');
  });
});

describe('loadTruncateOptionsFromEnv', () => {
  afterEach(() => {
    delete process.env.STACKDIFF_TRUNCATE_MAX_LENGTH;
    delete process.env.STACKDIFF_TRUNCATE_SUFFIX;
    delete process.env.STACKDIFF_TRUNCATE_KEYS;
  });

  it('loads maxLength from env', () => {
    process.env.STACKDIFF_TRUNCATE_MAX_LENGTH = '50';
    expect(loadTruncateOptionsFromEnv().maxLength).toBe(50);
  });

  it('loads suffix and keys from env', () => {
    process.env.STACKDIFF_TRUNCATE_SUFFIX = '~~';
    process.env.STACKDIFF_TRUNCATE_KEYS = 'FOO, BAR';
    const opts = loadTruncateOptionsFromEnv();
    expect(opts.suffix).toBe('~~');
    expect(opts.keys).toEqual(['FOO', 'BAR']);
  });

  it('ignores invalid maxLength', () => {
    process.env.STACKDIFF_TRUNCATE_MAX_LENGTH = 'notanumber';
    expect(loadTruncateOptionsFromEnv().maxLength).toBeUndefined();
  });
});
