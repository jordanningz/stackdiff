import { tagConfig, tagBothConfigs, loadTagMapFromEnv } from './tag';

const sampleConfig = {
  DB_HOST: 'localhost',
  DB_PORT: '5432',
  API_KEY: 'abc123',
  API_SECRET: 'secret',
  LOG_LEVEL: 'info',
  CACHE_TTL: '300',
};

const tagMap = {
  database: ['DB_*'],
  api: ['API_KEY', 'API_SECRET'],
  logging: ['LOG_LEVEL'],
};

describe('tagConfig', () => {
  it('tags keys matching wildcard patterns', () => {
    const result = tagConfig(sampleConfig, tagMap);
    expect(result.tagged['DB_HOST']).toContain('database');
    expect(result.tagged['DB_PORT']).toContain('database');
  });

  it('tags keys matching exact patterns', () => {
    const result = tagConfig(sampleConfig, tagMap);
    expect(result.tagged['API_KEY']).toContain('api');
    expect(result.tagged['API_SECRET']).toContain('api');
  });

  it('identifies untagged keys', () => {
    const result = tagConfig(sampleConfig, tagMap);
    expect(result.untagged).toContain('CACHE_TTL');
    expect(result.untagged).not.toContain('DB_HOST');
  });

  it('allows a key to have multiple tags', () => {
    const multiTagMap = { ...tagMap, sensitive: ['API_*'] };
    const result = tagConfig(sampleConfig, multiTagMap);
    expect(result.tagged['API_KEY']).toContain('api');
    expect(result.tagged['API_KEY']).toContain('sensitive');
  });

  it('returns empty tagged and all keys as untagged for empty tagMap', () => {
    const result = tagConfig(sampleConfig, {});
    expect(Object.keys(result.tagged)).toHaveLength(0);
    expect(result.untagged).toHaveLength(Object.keys(sampleConfig).length);
  });
});

describe('tagBothConfigs', () => {
  it('returns tag results for both staging and production', () => {
    const prod = { ...sampleConfig, DB_HOST: 'prod-db' };
    const result = tagBothConfigs(sampleConfig, prod, tagMap);
    expect(result.staging.tagged['DB_HOST']).toContain('database');
    expect(result.production.tagged['DB_HOST']).toContain('database');
  });
});

describe('loadTagMapFromEnv', () => {
  it('parses tag patterns from environment variables', () => {
    const env = {
      STACKDIFF_TAG_DATABASE: 'DB_HOST,DB_PORT',
      STACKDIFF_TAG_API: 'API_*',
    };
    const result = loadTagMapFromEnv(env);
    expect(result['database']).toEqual(['DB_HOST', 'DB_PORT']);
    expect(result['api']).toEqual(['API_*']);
  });

  it('ignores unrelated env vars', () => {
    const env = { NODE_ENV: 'test', STACKDIFF_TAG_INFRA: 'INFRA_*' };
    const result = loadTagMapFromEnv(env);
    expect(Object.keys(result)).toEqual(['infra']);
  });
});
