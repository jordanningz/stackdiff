/**
 * Transform config values using simple expression rules.
 * Supports: uppercase, lowercase, trim, prefix:<str>, suffix:<str>, replace:<from>:<to>
 */

export type TransformRule = string;

export interface TransformMap {
  [key: string]: TransformRule | TransformRule[];
}

export function applyTransform(value: string, rule: TransformRule): string {
  if (rule === 'uppercase') return value.toUpperCase();
  if (rule === 'lowercase') return value.toLowerCase();
  if (rule === 'trim') return value.trim();

  if (rule.startsWith('prefix:')) {
    const prefix = rule.slice('prefix:'.length);
    return `${prefix}${value}`;
  }

  if (rule.startsWith('suffix:')) {
    const suffix = rule.slice('suffix:'.length);
    return `${value}${suffix}`;
  }

  if (rule.startsWith('replace:')) {
    const parts = rule.slice('replace:'.length).split(':');
    if (parts.length >= 2) {
      const [from, to] = parts;
      return value.split(from).join(to);
    }
  }

  return value;
}

export function applyTransforms(value: string, rules: TransformRule | TransformRule[]): string {
  const ruleList = Array.isArray(rules) ? rules : [rules];
  return ruleList.reduce((v, rule) => applyTransform(v, rule), value);
}

export function transformConfig(
  config: Record<string, string>,
  transformMap: TransformMap
): Record<string, string> {
  const result: Record<string, string> = { ...config };
  for (const [key, rules] of Object.entries(transformMap)) {
    if (key in result) {
      result[key] = applyTransforms(result[key], rules);
    }
  }
  return result;
}

export function loadTransformMapFromEnv(env: Record<string, string | undefined> = process.env): TransformMap {
  const raw = env['STACKDIFF_TRANSFORM'];
  if (!raw) return {};
  try {
    return JSON.parse(raw) as TransformMap;
  } catch {
    return {};
  }
}
