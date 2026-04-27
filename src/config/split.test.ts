import { splitValue, splitConfig, splitBothConfigs, loadSplitOptionsFromEnv } from './split';

describe('splitValue', () => {
  it('splits on comma by default', () => {
    expect(splitValue('a,b,c')).toEqual(['a', 'b', 'c']);
  });

  it('trims whitespace by default', () => {
    expect(splitValue('a , b , c')).toEqual(['a', 'b', 'c']);
  });

  it('respects custom delimiter', () => {
    expect(splitValue('a|b|c', { delimiter: '|' })).toEqual(['a', 'b', 'c']);
  });

  it('respects maxParts', () => {
    expect(splitValue('a,b,c,d', { maxParts: 2 })).toEqual(['a', 'b,c,d']);
  });

  it('skips trim when disabled', () => {
    expect(splitValue('a , b', { trim: false })).toEqual(['a ', ' b']);
  });
});

describe('splitConfig', () => {
  const config = { HOSTS: 'host1,host2,host3', PORT: '8080', TAGS: 'x , y' };

  it('splits specified keys', () => {
    const result = splitConfig(config, ['HOSTS']);
    expect(result.results).toHaveLength(1);
    expect(result.results[0]).toEqual({
      key: 'HOSTS',
      original: 'host1,host2,host3',
      parts: ['host1', 'host2', 'host3'],
    });
    expect(result.skipped).toEqual([]);
  });

  it('records skipped keys when missing', () => {
    const result = splitConfig(config, ['MISSING']);
    expect(result.results).toHaveLength(0);
    expect(result.skipped).toEqual(['MISSING']);
  });

  it('handles multiple keys', () => {
    const result = splitConfig(config, ['HOSTS', 'TAGS', 'MISSING']);
    expect(result.results).toHaveLength(2);
    expect(result.skipped).toEqual(['MISSING']);
  });
});

describe('splitBothConfigs', () => {
  it('splits both staging and production', () => {
    const staging = { HOSTS: 'a,b' };
    const production = { HOSTS: 'c,d,e' };
    const result = splitBothConfigs(staging, production, ['HOSTS']);
    expect(result.staging.results[0].parts).toEqual(['a', 'b']);
    expect(result.production.results[0].parts).toEqual(['c', 'd', 'e']);
  });
});

describe('loadSplitOptionsFromEnv', () => {
  it('returns defaults', () => {
    delete process.env.SPLIT_DELIMITER;
    delete process.env.SPLIT_MAX_PARTS;
    delete process.env.SPLIT_TRIM;
    const opts = loadSplitOptionsFromEnv();
    expect(opts.delimiter).toBe(',');
    expect(opts.maxParts).toBeUndefined();
    expect(opts.trim).toBe(true);
  });

  it('reads env vars', () => {
    process.env.SPLIT_DELIMITER = ':';
    process.env.SPLIT_MAX_PARTS = '3';
    process.env.SPLIT_TRIM = 'false';
    const opts = loadSplitOptionsFromEnv();
    expect(opts.delimiter).toBe(':');
    expect(opts.maxParts).toBe(3);
    expect(opts.trim).toBe(false);
    delete process.env.SPLIT_DELIMITER;
    delete process.env.SPLIT_MAX_PARTS;
    delete process.env.SPLIT_TRIM;
  });
});
