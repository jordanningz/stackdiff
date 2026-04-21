import { EnvConfig } from './loader';

export type FieldType = 'string' | 'number' | 'boolean' | 'url' | 'email';

export interface FieldSchema {
  type: FieldType;
  required?: boolean;
  pattern?: RegExp;
  allowedValues?: string[];
}

export interface ConfigSchema {
  [key: string]: FieldSchema;
}

export interface SchemaViolation {
  key: string;
  expected: string;
  actual: string;
  message: string;
}

export interface SchemaResult {
  valid: boolean;
  violations: SchemaViolation[];
}

const TYPE_VALIDATORS: Record<FieldType, (v: string) => boolean> = {
  string: () => true,
  number: (v) => !isNaN(Number(v)),
  boolean: (v) => v === 'true' || v === 'false' || v === '1' || v === '0',
  url: (v) => { try { new URL(v); return true; } catch { return false; } },
  email: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
};

export function validateSchema(config: EnvConfig, schema: ConfigSchema): SchemaResult {
  const violations: SchemaViolation[] = [];

  for (const [key, field] of Object.entries(schema)) {
    const value = config[key];

    if (field.required && (value === undefined || value === '')) {
      violations.push({ key, expected: 'present', actual: 'missing', message: `Required key "${key}" is missing` });
      continue;
    }

    if (value === undefined) continue;

    if (!TYPE_VALIDATORS[field.type](value)) {
      violations.push({ key, expected: field.type, actual: typeof value, message: `Key "${key}" expected type ${field.type}` });
    }

    if (field.pattern && !field.pattern.test(value)) {
      violations.push({ key, expected: field.pattern.toString(), actual: value, message: `Key "${key}" does not match pattern ${field.pattern}` });
    }

    if (field.allowedValues && !field.allowedValues.includes(value)) {
      violations.push({ key, expected: field.allowedValues.join('|'), actual: value, message: `Key "${key}" must be one of: ${field.allowedValues.join(', ')}` });
    }
  }

  return { valid: violations.length === 0, violations };
}

export function loadSchemaFromEnv(env: Record<string, string | undefined> = process.env): ConfigSchema {
  const schema: ConfigSchema = {};
  const prefix = 'STACKDIFF_SCHEMA_';
  for (const [k, v] of Object.entries(env)) {
    if (k.startsWith(prefix) && v) {
      const key = k.slice(prefix.length).toLowerCase();
      schema[key] = { type: v as FieldType, required: false };
    }
  }
  return schema;
}
