import { computeStats, statsBothConfigs } from './stats';

describe('computeStats', () => {
  it('returns zero stats for empty config', () => {
    const result = computeStats({});
    expect(result.totalKeys).toBe(0);
    expect(result.avgValueLength).toBe(0);
  });

  it('counts total keys', () => {
    const result = computeStats({ A: 'foo', B: 'bar', C: '' });
    expect(result.totalKeys).toBe(3);
  });

  it('counts empty and non-empty values', () => {
    const result = computeStats({ A: '', B: '', C: 'hello' });
    expect(result.emptyValues).toBe(2);
    expect(result.nonEmptyValues).toBe(1);
  });

  it('detects numeric values', () => {
    const result = computeStats({ A: '42', B: '3.14', C: 'hello', D: '' });
    expect(result.numericValues).toBe(2);
  });

  it('detects boolean-like values', () => {
    const result = computeStats({ A: 'true', B: 'false', C: 'yes', D: 'no', E: '1', F: '0' });
    expect(result.booleanValues).toBe(6);
  });

  it('computes avg, max, min value lengths', () => {
    const result = computeStats({ A: 'ab', B: 'abcd', C: '' });
    expect(result.minValueLength).toBe(0);
    expect(result.maxValueLength).toBe(4);
    expect(result.avgValueLength).toBe(2);
  });

  it('counts unique and duplicate values', () => {
    const result = computeStats({ A: 'x', B: 'x', C: 'y' });
    expect(result.duplicateValues).toBe(2);
    expect(result.uniqueValues).toBe(1);
  });
});

describe('statsBothConfigs', () => {
  it('returns stats for both configs', () => {
    const staging = { A: 'foo', B: 'bar' };
    const production = { A: 'baz' };
    const result = statsBothConfigs(staging, production);
    expect(result.staging.totalKeys).toBe(2);
    expect(result.production.totalKeys).toBe(1);
  });
});
