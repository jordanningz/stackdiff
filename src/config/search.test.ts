import { searchConfig, searchBothConfigs } from './search';

const config = {
  DATABASE_URL: 'postgres://localhost:5432/app',
  REDIS_HOST: 'localhost',
  REDIS_PORT: '6379',
  API_KEY: 'secret-key-123',
  APP_NAME: 'myapp',
};

describe('searchConfig', () => {
  it('matches keys by default', () => {
    const result = searchConfig(config, 'REDIS');
    expect(result.total).toBe(2);
    expect(result.matches.map(m => m.key)).toEqual(['REDIS_HOST', 'REDIS_PORT']);
  });

  it('matches values', () => {
    const result = searchConfig(config, 'localhost');
    expect(result.total).toBe(2);
  });

  it('marks matchedOn correctly', () => {
    const result = searchConfig({ LOCALHOST: 'localhost' }, 'localhost');
    expect(result.matches[0].matchedOn).toBe('both');
  });

  it('is case-insensitive by default', () => {
    const result = searchConfig(config, 'redis');
    expect(result.total).toBe(2);
  });

  it('respects caseSensitive option', () => {
    const result = searchConfig(config, 'redis', { caseSensitive: true });
    expect(result.total).toBe(0);
  });

  it('supports regex queries', () => {
    const result = searchConfig(config, '^REDIS', { regex: true });
    expect(result.total).toBe(2);
  });

  it('can restrict to keys only', () => {
    const result = searchConfig(config, 'localhost', { matchValues: false });
    expect(result.total).toBe(0);
  });

  it('returns query in result', () => {
    const result = searchConfig(config, 'API');
    expect(result.query).toBe('API');
  });
});

describe('searchBothConfigs', () => {
  it('returns results for both configs', () => {
    const prod = { ...config, EXTRA_KEY: 'extra' };
    const result = searchBothConfigs(config, prod, 'REDIS');
    expect(result.staging.total).toBe(2);
    expect(result.production.total).toBe(2);
  });
});
