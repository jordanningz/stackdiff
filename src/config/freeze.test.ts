import { freezeConfig, freezeBothConfigs, loadFreezeOptionsFromEnv } from './freeze';

describe('freezeConfig', () => {
  const config = { API_URL: 'https://api.example.com', DB_HOST: 'localhost', PORT: '3000' };

  it('freezes all keys by default', () => {
    const result = freezeConfig(config);
    expect(result.frozenKeys).toEqual(['API_URL', 'DB_HOST', 'PORT']);
    expect(result.skippedKeys).toEqual([]);
    expect(Object.isFrozen(result.config)).toBe(true);
  });

  it('freezes only specified keys', () => {
    const result = freezeConfig(config, { keys: ['API_URL', 'PORT'] });
    expect(result.frozenKeys).toEqual(['API_URL', 'PORT']);
    expect(result.skippedKeys).toEqual(['DB_HOST']);
    expect(result.config['API_URL']).toBe('https://api.example.com');
    expect(result.config['DB_HOST']).toBeUndefined();
  });

  it('freezes keys matching pattern', () => {
    const result = freezeConfig(config, { pattern: /^DB_/ });
    expect(result.frozenKeys).toEqual(['DB_HOST']);
    expect(result.skippedKeys).toEqual(['API_URL', 'PORT']);
  });

  it('inverts match when invertMatch is true', () => {
    const result = freezeConfig(config, { pattern: /^DB_/, invertMatch: true });
    expect(result.frozenKeys).toEqual(['API_URL', 'PORT']);
    expect(result.skippedKeys).toEqual(['DB_HOST']);
  });

  it('returns frozen object that cannot be mutated', () => {
    const result = freezeConfig(config);
    expect(() => {
      (result.config as Record<string, string>)['NEW_KEY'] = 'value';
    }).toThrow();
  });

  it('handles empty config', () => {
    const result = freezeConfig({});
    expect(result.frozenKeys).toEqual([]);
    expect(result.skippedKeys).toEqual([]);
  });
});

describe('freezeBothConfigs', () => {
  it('freezes both staging and production', () => {
    const staging = { API_URL: 'https://staging.example.com' };
    const production = { API_URL: 'https://api.example.com' };
    const result = freezeBothConfigs(staging, production);
    expect(result.staging.frozenKeys).toEqual(['API_URL']);
    expect(result.production.frozenKeys).toEqual(['API_URL']);
    expect(Object.isFrozen(result.staging.config)).toBe(true);
    expect(Object.isFrozen(result.production.config)).toBe(true);
  });
});

describe('loadFreezeOptionsFromEnv', () => {
  afterEach(() => {
    delete process.env.STACKDIFF_FREEZE_KEYS;
    delete process.env.STACKDIFF_FREEZE_PATTERN;
    delete process.env.STACKDIFF_FREEZE_INVERT;
  });

  it('returns empty options when no env vars set', () => {
    const opts = loadFreezeOptionsFromEnv();
    expect(opts.keys).toBeUndefined();
    expect(opts.pattern).toBeUndefined();
    expect(opts.invertMatch).toBe(false);
  });

  it('parses STACKDIFF_FREEZE_KEYS', () => {
    process.env.STACKDIFF_FREEZE_KEYS = 'API_URL, DB_HOST';
    const opts = loadFreezeOptionsFromEnv();
    expect(opts.keys).toEqual(['API_URL', 'DB_HOST']);
  });

  it('parses STACKDIFF_FREEZE_PATTERN', () => {
    process.env.STACKDIFF_FREEZE_PATTERN = '^DB_';
    const opts = loadFreezeOptionsFromEnv();
    expect(opts.pattern).toEqual(/^DB_/);
  });

  it('parses STACKDIFF_FREEZE_INVERT', () => {
    process.env.STACKDIFF_FREEZE_INVERT = 'true';
    const opts = loadFreezeOptionsFromEnv();
    expect(opts.invertMatch).toBe(true);
  });
});
