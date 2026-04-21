import { redactValue, redactConfig, redactBothConfigs } from './redact';

describe('redactValue', () => {
  it('redacts sensitive keys by default', () => {
    expect(redactValue('API_KEY', 'abc123')).toBe('[REDACTED]');
    expect(redactValue('DB_PASSWORD', 'secret')).toBe('[REDACTED]');
    expect(redactValue('AUTH_TOKEN', 'tok')).toBe('[REDACTED]');
  });

  it('leaves non-sensitive keys unchanged', () => {
    expect(redactValue('APP_ENV', 'production')).toBe('production');
    expect(redactValue('PORT', '3000')).toBe('3000');
  });

  it('uses custom placeholder', () => {
    expect(redactValue('API_KEY', 'abc', { placeholder: '***' })).toBe('***');
  });

  it('redacts extra keys', () => {
    expect(redactValue('MY_CUSTOM', 'val', { keys: ['MY_CUSTOM'] })).toBe('[REDACTED]');
  });

  it('redacts keys matching patterns', () => {
    expect(redactValue('STRIPE_LIVE_KEY', 'sk_live_x', { patterns: [/STRIPE/] })).toBe('[REDACTED]');
    expect(redactValue('APP_NAME', 'myapp', { patterns: [/STRIPE/] })).toBe('myapp');
  });
});

describe('redactConfig', () => {
  const config = {
    APP_ENV: 'staging',
    API_KEY: 'key123',
    PORT: '8080',
    DB_PASSWORD: 'pass',
  };

  it('redacts sensitive keys and tracks them', () => {
    const { config: result, redactedKeys } = redactConfig(config);
    expect(result.APP_ENV).toBe('staging');
    expect(result.API_KEY).toBe('[REDACTED]');
    expect(result.DB_PASSWORD).toBe('[REDACTED]');
    expect(redactedKeys).toContain('API_KEY');
    expect(redactedKeys).toContain('DB_PASSWORD');
    expect(redactedKeys).not.toContain('APP_ENV');
  });

  it('returns empty redactedKeys when nothing sensitive', () => {
    const { redactedKeys } = redactConfig({ PORT: '3000', HOST: 'localhost' });
    expect(redactedKeys).toHaveLength(0);
  });
});

describe('redactBothConfigs', () => {
  it('redacts staging and production independently', () => {
    const staging = { API_KEY: 's-key', APP_ENV: 'staging' };
    const production = { API_KEY: 'p-key', APP_ENV: 'production' };
    const result = redactBothConfigs(staging, production);
    expect(result.staging.config.API_KEY).toBe('[REDACTED]');
    expect(result.production.config.API_KEY).toBe('[REDACTED]');
    expect(result.staging.config.APP_ENV).toBe('staging');
    expect(result.production.config.APP_ENV).toBe('production');
  });
});
