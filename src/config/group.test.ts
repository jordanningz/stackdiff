import { groupByPrefix, groupBothConfigs, listPrefixes } from './group';

describe('groupByPrefix', () => {
  const config = {
    DB_HOST: 'localhost',
    DB_PORT: '5432',
    REDIS_URL: 'redis://localhost',
    REDIS_TTL: '3600',
    APP_NAME: 'myapp',
    PORT: '8080',
  };

  it('groups keys by prefix', () => {
    const result = groupByPrefix(config);
    expect(result.groups['DB']).toEqual({ HOST: 'localhost', PORT: '5432' });
    expect(result.groups['REDIS']).toEqual({ URL: 'redis://localhost', TTL: '3600' });
    expect(result.groups['APP']).toEqual({ NAME: 'myapp' });
  });

  it('puts keys without delimiter in ungrouped', () => {
    const result = groupByPrefix(config);
    expect(result.ungrouped).toEqual({ PORT: '8080' });
  });

  it('supports lowercase option', () => {
    const result = groupByPrefix(config, { lowercase: true });
    expect(result.groups['db']).toBeDefined();
    expect(result.groups['redis']).toBeDefined();
  });

  it('supports custom delimiter', () => {
    const cfg = { 'db.host': 'localhost', 'db.port': '5432', standalone: 'yes' };
    const result = groupByPrefix(cfg, { delimiter: '.' });
    expect(result.groups['db']).toEqual({ host: 'localhost', port: '5432' });
    expect(result.ungrouped).toEqual({ standalone: 'yes' });
  });

  it('handles empty config', () => {
    const result = groupByPrefix({});
    expect(result.groups).toEqual({});
    expect(result.ungrouped).toEqual({});
  });
});

describe('groupBothConfigs', () => {
  it('groups staging and production separately', () => {
    const staging = { DB_HOST: 'staging-db', PORT: '8080' };
    const production = { DB_HOST: 'prod-db', PORT: '80' };
    const result = groupBothConfigs(staging, production);
    expect(result.staging.groups['DB']).toEqual({ HOST: 'staging-db' });
    expect(result.production.groups['DB']).toEqual({ HOST: 'prod-db' });
  });
});

describe('listPrefixes', () => {
  it('returns sorted unique prefixes', () => {
    const config = { DB_HOST: 'x', DB_PORT: 'y', APP_NAME: 'z', PORT: '80' };
    expect(listPrefixes(config)).toEqual(['APP', 'DB']);
  });

  it('returns empty array for no prefixed keys', () => {
    expect(listPrefixes({ PORT: '80', HOST: 'x' })).toEqual([]);
  });
});
