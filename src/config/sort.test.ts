import { sortConfig, sortBothConfigs, loadSortOptionsFromEnv } from './sort';

describe('sortConfig', () => {
  const config = { ZEBRA: 'z', apple: 'a', MANGO: 'm', banana: 'b' };

  it('sorts keys ascending (case-insensitive) by default', () => {
    const result = sortConfig(config);
    expect(Object.keys(result)).toEqual(['apple', 'banana', 'MANGO', 'ZEBRA']);
  });

  it('sorts keys descending when order is desc', () => {
    const result = sortConfig(config, { order: 'desc' });
    expect(Object.keys(result)).toEqual(['ZEBRA', 'MANGO', 'banana', 'apple']);
  });

  it('sorts case-sensitively when caseSensitive is true', () => {
    const result = sortConfig(config, { caseSensitive: true });
    // uppercase letters come before lowercase in ASCII
    expect(Object.keys(result)).toEqual(['MANGO', 'ZEBRA', 'apple', 'banana']);
  });

  it('places priorityKeys first in order', () => {
    const result = sortConfig(config, { priorityKeys: ['MANGO', 'apple'] });
    const keys = Object.keys(result);
    expect(keys[0]).toBe('MANGO');
    expect(keys[1]).toBe('apple');
  });

  it('preserves values after sorting', () => {
    const result = sortConfig(config);
    expect(result['apple']).toBe('a');
    expect(result['ZEBRA']).toBe('z');
  });

  it('returns empty object for empty input', () => {
    expect(sortConfig({})).toEqual({});
  });
});

describe('sortBothConfigs', () => {
  it('sorts both staging and production configs', () => {
    const staging = { Z: '1', A: '2' };
    const production = { Y: '3', B: '4' };
    const result = sortBothConfigs(staging, production);
    expect(Object.keys(result.staging)).toEqual(['A', 'Z']);
    expect(Object.keys(result.production)).toEqual(['B', 'Y']);
  });
});

describe('loadSortOptionsFromEnv', () => {
  beforeEach(() => {
    delete process.env.STACKDIFF_SORT_ORDER;
    delete process.env.STACKDIFF_SORT_CASE_SENSITIVE;
    delete process.env.STACKDIFF_SORT_PRIORITY;
  });

  it('returns default options when env vars are not set', () => {
    const opts = loadSortOptionsFromEnv();
    expect(opts.order).toBe('asc');
    expect(opts.caseSensitive).toBe(false);
    expect(opts.priorityKeys).toEqual([]);
  });

  it('reads STACKDIFF_SORT_ORDER from env', () => {
    process.env.STACKDIFF_SORT_ORDER = 'desc';
    expect(loadSortOptionsFromEnv().order).toBe('desc');
  });

  it('reads STACKDIFF_SORT_PRIORITY as comma-separated keys', () => {
    process.env.STACKDIFF_SORT_PRIORITY = 'NODE_ENV, PORT, APP_NAME';
    const opts = loadSortOptionsFromEnv();
    expect(opts.priorityKeys).toEqual(['NODE_ENV', 'PORT', 'APP_NAME']);
  });

  it('reads STACKDIFF_SORT_CASE_SENSITIVE flag', () => {
    process.env.STACKDIFF_SORT_CASE_SENSITIVE = 'true';
    expect(loadSortOptionsFromEnv().caseSensitive).toBe(true);
  });
});
