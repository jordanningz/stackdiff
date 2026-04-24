import { renameKeys, renameBothConfigs, loadRenameMapFromEnv } from './rename';

describe('renameKeys', () => {
  const config = { OLD_API_URL: 'https://api.example.com', DB_HOST: 'localhost', PORT: '3000' };

  it('renames matching keys', () => {
    const result = renameKeys(config, { OLD_API_URL: 'API_URL' });
    expect(result.config['API_URL']).toBe('https://api.example.com');
    expect(result.config['OLD_API_URL']).toBeUndefined();
  });

  it('tracks renamed entries', () => {
    const result = renameKeys(config, { OLD_API_URL: 'API_URL', DB_HOST: 'DATABASE_HOST' });
    expect(result.renamed).toHaveLength(2);
    expect(result.renamed).toContainEqual({ from: 'OLD_API_URL', to: 'API_URL' });
  });

  it('tracks keys not found', () => {
    const result = renameKeys(config, { MISSING_KEY: 'NEW_KEY' });
    expect(result.notFound).toContain('MISSING_KEY');
    expect(result.renamed).toHaveLength(0);
  });

  it('preserves unaffected keys', () => {
    const result = renameKeys(config, { OLD_API_URL: 'API_URL' });
    expect(result.config['DB_HOST']).toBe('localhost');
    expect(result.config['PORT']).toBe('3000');
  });

  it('handles empty rename map', () => {
    const result = renameKeys(config, {});
    expect(result.config).toEqual(config);
    expect(result.renamed).toHaveLength(0);
  });
});

describe('renameBothConfigs', () => {
  it('renames keys in both configs independently', () => {
    const staging = { OLD_KEY: 'stg' };
    const production = { OLD_KEY: 'prod', EXTRA: 'val' };
    const result = renameBothConfigs(staging, production, { OLD_KEY: 'NEW_KEY' });
    expect(result.staging.config['NEW_KEY']).toBe('stg');
    expect(result.production.config['NEW_KEY']).toBe('prod');
    expect(result.production.config['EXTRA']).toBe('val');
  });
});

describe('loadRenameMapFromEnv', () => {
  it('parses comma-separated key:value pairs', () => {
    const map = loadRenameMapFromEnv('OLD_API_URL:API_URL,DB_HOST:DATABASE_HOST');
    expect(map['OLD_API_URL']).toBe('API_URL');
    expect(map['DB_HOST']).toBe('DATABASE_HOST');
  });

  it('ignores malformed pairs', () => {
    const map = loadRenameMapFromEnv('VALID:KEY,INVALID');
    expect(map['VALID']).toBe('KEY');
    expect(Object.keys(map)).toHaveLength(1);
  });

  it('handles empty string', () => {
    const map = loadRenameMapFromEnv('');
    expect(Object.keys(map)).toHaveLength(0);
  });
});
