import { isSensitiveKey } from './mask';

export interface RedactOptions {
  placeholder?: string;
  keys?: string[];
  patterns?: RegExp[];
}

export interface RedactResult {
  config: Record<string, string>;
  redactedKeys: string[];
}

const DEFAULT_PLACEHOLDER = '[REDACTED]';

export function redactValue(
  key: string,
  value: string,
  options: RedactOptions = {}
): string {
  const placeholder = options.placeholder ?? DEFAULT_PLACEHOLDER;
  const extraKeys = options.keys ?? [];
  const patterns = options.patterns ?? [];

  if (isSensitiveKey(key) || extraKeys.includes(key)) {
    return placeholder;
  }

  for (const pattern of patterns) {
    if (pattern.test(key)) {
      return placeholder;
    }
  }

  return value;
}

export function redactConfig(
  config: Record<string, string>,
  options: RedactOptions = {}
): RedactResult {
  const redactedKeys: string[] = [];
  const result: Record<string, string> = {};

  for (const [key, value] of Object.entries(config)) {
    const redacted = redactValue(key, value, options);
    result[key] = redacted;
    if (redacted !== value) {
      redactedKeys.push(key);
    }
  }

  return { config: result, redactedKeys };
}

export function redactBothConfigs(
  staging: Record<string, string>,
  production: Record<string, string>,
  options: RedactOptions = {}
): { staging: RedactResult; production: RedactResult } {
  return {
    staging: redactConfig(staging, options),
    production: redactConfig(production, options),
  };
}
