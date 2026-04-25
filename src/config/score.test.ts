import { scoreConfig, scoreBothConfigs } from './score';

const reference = {
  API_KEY: 'abc',
  DB_HOST: 'localhost',
  DB_PORT: '5432',
};

describe('scoreConfig', () => {
  it('returns full score for a perfect config', () => {
    const result = scoreConfig({ ...reference }, reference);
    expect(result.score).toBe(100);
    expect(result.pct).toBe(100);
    expect(result.penalties).toHaveLength(0);
  });

  it('penalises missing keys', () => {
    const config = { API_KEY: 'abc', DB_HOST: 'localhost' };
    const result = scoreConfig(config, reference);
    const missing = result.penalties.find(p => p.key === 'DB_PORT');
    expect(missing).toBeDefined();
    expect(missing!.reason).toBe('missing key');
    expect(result.score).toBeLessThan(100);
  });

  it('penalises extra keys not in reference', () => {
    const config = { ...reference, EXTRA_KEY: 'oops' };
    const result = scoreConfig(config, reference);
    const extra = result.penalties.find(p => p.key === 'EXTRA_KEY');
    expect(extra).toBeDefined();
    expect(extra!.reason).toMatch(/extra key/);
  });

  it('penalises empty values', () => {
    const config = { ...reference, API_KEY: '' };
    const result = scoreConfig(config, reference);
    const empty = result.penalties.find(p => p.key === 'API_KEY' && p.reason === 'empty value');
    expect(empty).toBeDefined();
  });

  it('penalises values over 512 chars', () => {
    const config = { ...reference, API_KEY: 'x'.repeat(600) };
    const result = scoreConfig(config, reference);
    const long = result.penalties.find(p => p.reason.includes('512'));
    expect(long).toBeDefined();
  });

  it('penalises duplicate values', () => {
    const config = { ...reference, DB_HOST: 'same', DB_PORT: 'same' };
    const result = scoreConfig(config, reference);
    const dup = result.penalties.find(p => p.reason.includes('duplicate'));
    expect(dup).toBeDefined();
  });

  it('score never goes below 0', () => {
    const config = {};
    const result = scoreConfig(config, reference);
    expect(result.score).toBeGreaterThanOrEqual(0);
  });

  it('respects custom weights', () => {
    const config = { API_KEY: 'abc', DB_HOST: 'localhost' };
    const low = scoreConfig(config, reference, { missingKeys: 1 });
    const high = scoreConfig(config, reference, { missingKeys: 50 });
    expect(low.score).toBeGreaterThan(high.score);
  });
});

describe('scoreBothConfigs', () => {
  it('returns scores for both staging and production', () => {
    const staging = { ...reference };
    const production = { API_KEY: 'abc' };
    const result = scoreBothConfigs(staging, production, reference);
    expect(result.staging.score).toBeGreaterThan(result.production.score);
    expect(result.production.penalties.length).toBeGreaterThan(0);
  });
});
