import { trimValue, trimConfig, trimBothConfigs } from './trim';

describe('trimValue', () => {
  it('trims leading and trailing whitespace by default', () => {
    expect(trimValue('  hello  ')).toBe('hello');
  });

  it('does not trim whitespace when disabled', () => {
    expect(trimValue('  hello  ', { trimWhitespace: false })).toBe('  hello  ');
  });

  it('trims double quotes when trimQuotes is true', () => {
    expect(trimValue('"hello"', { trimQuotes: true })).toBe('hello');
  });

  it('trims single quotes when trimQuotes is true', () => {
    expect(trimValue("'hello'", { trimQuotes: true })).toBe('hello');
  });

  it('trims backtick quotes when trimQuotes is true', () => {
    expect(trimValue('`hello`', { trimQuotes: true })).toBe('hello');
  });

  it('does not trim mismatched quotes', () => {
    expect(trimValue('"hello\'', { trimQuotes: true })).toBe('"hello\'');
  });

  it('does not trim quotes when trimQuotes is false', () => {
    expect(trimValue('"hello"', { trimQuotes: false })).toBe('"hello"');
  });

  it('trims whitespace then quotes in order', () => {
    expect(trimValue('  "hello"  ', { trimWhitespace: true, trimQuotes: true })).toBe('hello');
  });
});

describe('trimConfig', () => {
  it('trims all values and reports changed keys', () => {
    const config = { A: '  foo  ', B: 'bar', C: '  baz' };
    const { config: result, trimmed } = trimConfig(config);
    expect(result).toEqual({ A: 'foo', B: 'bar', C: 'baz' });
    expect(Object.keys(trimmed)).toEqual(['A', 'C']);
    expect(trimmed['A']).toEqual({ before: '  foo  ', after: 'foo' });
  });

  it('returns empty trimmed when nothing changes', () => {
    const config = { A: 'clean', B: 'value' };
    const { trimmed } = trimConfig(config);
    expect(Object.keys(trimmed)).toHaveLength(0);
  });
});

describe('trimBothConfigs', () => {
  it('trims staging and production independently', () => {
    const staging = { KEY: '  staging  ' };
    const production = { KEY: '"prod"' };
    const result = trimBothConfigs(staging, production, { trimQuotes: true });
    expect(result.staging.config.KEY).toBe('staging');
    expect(result.production.config.KEY).toBe('prod');
  });
});
