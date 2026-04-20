import {
  applyTransform,
  applyTransforms,
  transformConfig,
  loadTransformMapFromEnv,
} from './transform';

describe('applyTransform', () => {
  it('uppercases a value', () => {
    expect(applyTransform('hello', 'uppercase')).toBe('HELLO');
  });

  it('lowercases a value', () => {
    expect(applyTransform('WORLD', 'lowercase')).toBe('world');
  });

  it('trims whitespace', () => {
    expect(applyTransform('  spaced  ', 'trim')).toBe('spaced');
  });

  it('adds a prefix', () => {
    expect(applyTransform('value', 'prefix:prod_')).toBe('prod_value');
  });

  it('adds a suffix', () => {
    expect(applyTransform('value', 'suffix:_v2')).toBe('value_v2');
  });

  it('replaces a substring', () => {
    expect(applyTransform('foo-bar-foo', 'replace:foo:baz')).toBe('baz-bar-baz');
  });

  it('returns value unchanged for unknown rule', () => {
    expect(applyTransform('unchanged', 'unknown_rule')).toBe('unchanged');
  });
});

describe('applyTransforms', () => {
  it('applies multiple rules in sequence', () => {
    expect(applyTransforms('  hello  ', ['trim', 'uppercase'])).toBe('HELLO');
  });

  it('handles a single rule as string', () => {
    expect(applyTransforms('test', 'uppercase')).toBe('TEST');
  });
});

describe('transformConfig', () => {
  it('transforms only specified keys', () => {
    const config = { APP_NAME: 'myapp', PORT: '3000', ENV: 'staging' };
    const result = transformConfig(config, { APP_NAME: 'uppercase', ENV: ['uppercase', 'prefix:ENV_'] });
    expect(result.APP_NAME).toBe('MYAPP');
    expect(result.ENV).toBe('ENV_STAGING');
    expect(result.PORT).toBe('3000');
  });

  it('ignores keys not present in config', () => {
    const config = { FOO: 'bar' };
    const result = transformConfig(config, { MISSING: 'uppercase' });
    expect(result).toEqual({ FOO: 'bar' });
  });
});

describe('loadTransformMapFromEnv', () => {
  it('returns empty object when env var is not set', () => {
    expect(loadTransformMapFromEnv({})).toEqual({});
  });

  it('parses valid JSON from env var', () => {
    const env = { STACKDIFF_TRANSFORM: JSON.stringify({ KEY: 'uppercase' }) };
    expect(loadTransformMapFromEnv(env)).toEqual({ KEY: 'uppercase' });
  });

  it('returns empty object on invalid JSON', () => {
    const env = { STACKDIFF_TRANSFORM: '{invalid}' };
    expect(loadTransformMapFromEnv(env)).toEqual({});
  });
});
