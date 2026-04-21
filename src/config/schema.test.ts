import { validateSchema, loadSchemaFromEnv, ConfigSchema } from './schema';

const baseConfig = {
  PORT: '3000',
  DEBUG: 'true',
  API_URL: 'https://api.example.com',
  EMAIL: 'admin@example.com',
  NODE_ENV: 'production',
};

describe('validateSchema', () => {
  it('returns valid when all fields match schema', () => {
    const schema: ConfigSchema = {
      PORT: { type: 'number' },
      DEBUG: { type: 'boolean' },
      API_URL: { type: 'url' },
      EMAIL: { type: 'email' },
    };
    const result = validateSchema(baseConfig, schema);
    expect(result.valid).toBe(true);
    expect(result.violations).toHaveLength(0);
  });

  it('reports missing required keys', () => {
    const schema: ConfigSchema = { SECRET_KEY: { type: 'string', required: true } };
    const result = validateSchema(baseConfig, schema);
    expect(result.valid).toBe(false);
    expect(result.violations[0].key).toBe('SECRET_KEY');
    expect(result.violations[0].message).toMatch(/Required/);
  });

  it('reports invalid number', () => {
    const schema: ConfigSchema = { PORT: { type: 'number' } };
    const result = validateSchema({ PORT: 'not-a-number' }, schema);
    expect(result.valid).toBe(false);
    expect(result.violations[0].key).toBe('PORT');
  });

  it('reports invalid boolean', () => {
    const schema: ConfigSchema = { DEBUG: { type: 'boolean' } };
    const result = validateSchema({ DEBUG: 'yes' }, schema);
    expect(result.valid).toBe(false);
  });

  it('reports invalid url', () => {
    const schema: ConfigSchema = { API_URL: { type: 'url' } };
    const result = validateSchema({ API_URL: 'not-a-url' }, schema);
    expect(result.valid).toBe(false);
  });

  it('validates allowedValues', () => {
    const schema: ConfigSchema = { NODE_ENV: { type: 'string', allowedValues: ['development', 'staging', 'production'] } };
    const result = validateSchema(baseConfig, schema);
    expect(result.valid).toBe(true);

    const bad = validateSchema({ NODE_ENV: 'test' }, schema);
    expect(bad.valid).toBe(false);
    expect(bad.violations[0].message).toMatch(/must be one of/);
  });

  it('validates pattern', () => {
    const schema: ConfigSchema = { PORT: { type: 'string', pattern: /^\d{4}$/ } };
    const result = validateSchema(baseConfig, schema);
    expect(result.valid).toBe(true);

    const bad = validateSchema({ PORT: '80' }, schema);
    expect(bad.valid).toBe(false);
  });

  it('skips optional missing keys', () => {
    const schema: ConfigSchema = { OPTIONAL_KEY: { type: 'string', required: false } };
    const result = validateSchema({}, schema);
    expect(result.valid).toBe(true);
  });
});

describe('loadSchemaFromEnv', () => {
  it('parses schema from env vars', () => {
    const env = { STACKDIFF_SCHEMA_PORT: 'number', STACKDIFF_SCHEMA_DEBUG: 'boolean' };
    const schema = loadSchemaFromEnv(env);
    expect(schema['port']).toEqual({ type: 'number', required: false });
    expect(schema['debug']).toEqual({ type: 'boolean', required: false });
  });

  it('ignores unrelated env vars', () => {
    const env = { OTHER_VAR: 'string' };
    const schema = loadSchemaFromEnv(env);
    expect(Object.keys(schema)).toHaveLength(0);
  });
});
