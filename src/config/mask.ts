// Mask sensitive values in config diffs

const DEFAULT_SENSITIVE_PATTERNS = [
  /password/i,
  /secret/i,
  /token/i,
  /api_key/i,
  /private/i,
  /credential/i,
  /auth/i,
];

export interface MaskOptions {
  patterns?: RegExp[];
  placeholder?: string;
  includeDefaults?: boolean;
}

export function isSensitiveKey(key: string, patterns: RegExp[]): boolean {
  return patterns.some((p) => p.test(key));
}

export function maskValue(value: string, placeholder: string): string {
  if (value.length === 0) return placeholder;
  return placeholder;
}

export function maskConfig(
  config: Record<string, string>,
  options: MaskOptions = {}
): Record<string, string> {
  const {
    patterns = [],
    placeholder = "***",
    includeDefaults = true,
  } = options;

  const allPatterns = includeDefaults
    ? [...DEFAULT_SENSITIVE_PATTERNS, ...patterns]
    : patterns;

  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(config)) {
    result[key] = isSensitiveKey(key, allPatterns)
      ? maskValue(value, placeholder)
      : value;
  }
  return result;
}

export function getMaskedKeys(
  config: Record<string, string>,
  options: MaskOptions = {}
): string[] {
  const { patterns = [], includeDefaults = true } = options;
  const allPatterns = includeDefaults
    ? [...DEFAULT_SENSITIVE_PATTERNS, ...patterns]
    : patterns;
  return Object.keys(config).filter((k) => isSensitiveKey(k, allPatterns));
}
