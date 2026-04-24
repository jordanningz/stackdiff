import { cloneConfig, cloneBothConfigs } from './clone';

const sampleConfig = {
  DB_HOST: 'localhost',
  DB_PORT: '5432',
  API_KEY: 'secret',
  APP_NAME: 'myapp',
};

describe('cloneConfig', () => {
  it('clones all keys with no options', () => {
    const result = cloneConfig(sampleConfig);
    expect(result.cloned).toEqual(sampleConfig);
    expect(result.renamedKeys).toHaveLength(0);
    expect(result.skipped).toHaveLength(0);
  });

  it('applies prefix to all keys', () => {
    const result = cloneConfig(sampleConfig, { prefix: 'COPY_' });
    expect(result.cloned).toHaveProperty('COPY_DB_HOST', 'localhost');
    expect(result.cloned).toHaveProperty('COPY_API_KEY', 'secret');
    expect(result.renamedKeys).toHaveLength(4);
    expect(result.renamedKeys[0]).toEqual({ from: 'DB_HOST', to: 'COPY_DB_HOST' });
  });

  it('applies suffix to all keys', () => {
    const result = cloneConfig(sampleConfig, { suffix: '_BACKUP' });
    expect(result.cloned).toHaveProperty('DB_HOST_BACKUP', 'localhost');
    expect(result.cloned).toHaveProperty('APP_NAME_BACKUP', 'myapp');
  });

  it('applies prefix and suffix together', () => {
    const result = cloneConfig(sampleConfig, { prefix: 'OLD_', suffix: '_V1' });
    expect(result.cloned).toHaveProperty('OLD_DB_HOST_V1', 'localhost');
  });

  it('clones only specified keys', () => {
    const result = cloneConfig(sampleConfig, { keys: ['DB_HOST', 'DB_PORT'] });
    expect(Object.keys(result.cloned)).toHaveLength(2);
    expect(result.cloned).toHaveProperty('DB_HOST');
    expect(result.cloned).not.toHaveProperty('API_KEY');
  });

  it('ignores missing keys in keys filter', () => {
    const result = cloneConfig(sampleConfig, { keys: ['DB_HOST', 'MISSING_KEY'] });
    expect(Object.keys(result.cloned)).toHaveLength(1);
  });

  it('preserves source reference', () => {
    const result = cloneConfig(sampleConfig);
    expect(result.source).toBe(sampleConfig);
  });
});

describe('cloneBothConfigs', () => {
  it('clones staging and production independently', () => {
    const prod = { DB_HOST: 'prod-db', API_KEY: 'prod-secret' };
    const result = cloneBothConfigs(sampleConfig, prod, { prefix: 'BAK_' });
    expect(result.staging.cloned).toHaveProperty('BAK_DB_HOST', 'localhost');
    expect(result.production.cloned).toHaveProperty('BAK_DB_HOST', 'prod-db');
  });
});
