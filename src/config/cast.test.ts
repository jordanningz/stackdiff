import { castValue, castConfig, loadCastMapFromEnv } from './cast';

describe('castValue', () => {
  it('returns string as-is for type string', () => {
    expect(castValue('hello', 'string')).toMatchObject({ casted: 'hello', resolved: 'string' });
  });

  it('casts true/false strings to boolean', () => {
    expect(castValue('true', 'boolean').casted).toBe(true);
    expect(castValue('false', 'boolean').casted).toBe(false);
    expect(castValue('yes', 'boolean').casted).toBe(true);
    expect(castValue('no', 'boolean').casted).toBe(false);
  });

  it('returns error for invalid boolean', () => {
    const r = castValue('maybe', 'boolean');
    expect(r.error).toBeDefined();
    expect(r.casted).toBe('maybe');
  });

  it('casts numeric strings to number', () => {
    expect(castValue('42', 'number').casted).toBe(42);
    expect(castValue('3.14', 'number').casted).toBeCloseTo(3.14);
  });

  it('returns error for invalid number', () => {
    const r = castValue('abc', 'number');
    expect(r.error).toBeDefined();
  });

  it('parses JSON values', () => {
    expect(castValue('[1,2,3]', 'json').casted).toEqual([1, 2, 3]);
    expect(castValue('{"a":1}', 'json').casted).toEqual({ a: 1 });
  });

  it('returns error for invalid JSON', () => {
    const r = castValue('{bad}', 'json');
    expect(r.error).toBeDefined();
  });

  it('auto-detects booleans, numbers, and falls back to string', () => {
    expect(castValue('true', 'auto').casted).toBe(true);
    expect(castValue('99', 'auto').casted).toBe(99);
    expect(castValue('hello', 'auto').casted).toBe('hello');
  });
});

describe('castConfig', () => {
  const config = { PORT: '3000', DEBUG: 'true', NAME: 'app', RATIO: '0.5' };

  it('casts all values with auto by default', () => {
    const result = castConfig(config);
    expect(result.values.PORT).toBe(3000);
    expect(result.values.DEBUG).toBe(true);
    expect(result.values.NAME).toBe('app');
  });

  it('respects typeMap overrides', () => {
    const result = castConfig(config, { PORT: 'string' });
    expect(result.values.PORT).toBe('3000');
  });

  it('collects errors without failing', () => {
    const result = castConfig({ X: 'notanumber' }, { X: 'number' });
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0].key).toBe('X');
  });

  it('strict mode keeps original value on error', () => {
    const result = castConfig({ X: 'bad' }, { X: 'number' }, { strict: true });
    expect(result.values.X).toBe('bad');
  });
});

describe('loadCastMapFromEnv', () => {
  it('parses STACKDIFF_CAST_MAP into a type map', () => {
    const map = loadCastMapFromEnv({ STACKDIFF_CAST_MAP: 'PORT:number,DEBUG:boolean' });
    expect(map).toEqual({ PORT: 'number', DEBUG: 'boolean' });
  });

  it('returns empty map when env var is absent', () => {
    expect(loadCastMapFromEnv({})).toEqual({});
  });
});
