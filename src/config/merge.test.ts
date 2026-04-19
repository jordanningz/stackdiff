import { mergeConfigs, mergeWithBase } from './merge';

const staging = { HOST: 'staging.example.com', PORT: '3000', DEBUG: 'true' };
const production = { HOST: 'prod.example.com', PORT: '8080', WORKERS: '4' };

describe('mergeConfigs', () => {
  it('prefer-staging: staging values win', () => {
    const result = mergeConfigs(staging, production, { strategy: 'prefer-staging' });
    expect(result.HOST).toBe('staging.example.com');
    expect(result.PORT).toBe('3000');
    expect(result.WORKERS).toBe('4');
  });

  it('prefer-production: production values win', () => {
    const result = mergeConfigs(staging, production, { strategy: 'prefer-production' });
    expect(result.HOST).toBe('prod.example.com');
    expect(result.PORT).toBe('8080');
    expect(result.DEBUG).toBe('true');
  });

  it('union: all keys present', () => {
    const result = mergeConfigs(staging, production, { strategy: 'union' });
    expect(Object.keys(result)).toContain('DEBUG');
    expect(Object.keys(result)).toContain('WORKERS');
  });

  it('intersection: only shared keys', () => {
    const result = mergeConfigs(staging, production, { strategy: 'intersection' });
    expect(Object.keys(result)).toContain('HOST');
    expect(Object.keys(result)).toContain('PORT');
    expect(Object.keys(result)).not.toContain('DEBUG');
    expect(Object.keys(result)).not.toContain('WORKERS');
  });

  it('applies overrides on top of merged result', () => {
    const result = mergeConfigs(staging, production, {
      strategy: 'prefer-production',
      overrides: { HOST: 'override.example.com' },
    });
    expect(result.HOST).toBe('override.example.com');
  });
});

describe('mergeWithBase', () => {
  it('overlay values replace base', () => {
    const result = mergeWithBase({ A: '1', B: '2' }, { B: '99', C: '3' });
    expect(result).toEqual({ A: '1', B: '99', C: '3' });
  });

  it('returns base when overlay is empty', () => {
    const result = mergeWithBase({ A: '1' }, {});
    expect(result).toEqual({ A: '1' });
  });
});
