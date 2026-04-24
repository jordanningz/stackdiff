/**
 * Flatten nested config objects into dot-notation keys,
 * and unflatten dot-notation keys back into nested objects.
 */

export type FlatConfig = Record<string, string>;
export type NestedConfig = Record<string, unknown>;

/**
 * Flatten a nested object into dot-notation key/value pairs.
 * Only string leaf values are retained (matching env-file semantics).
 */
export function flattenConfig(
  obj: NestedConfig,
  prefix = "",
  result: FlatConfig = {}
): FlatConfig {
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (value !== null && typeof value === "object" && !Array.isArray(value)) {
      flattenConfig(value as NestedConfig, fullKey, result);
    } else if (Array.isArray(value)) {
      value.forEach((item, idx) => {
        const arrKey = `${fullKey}[${idx}]`;
        if (typeof item === "object" && item !== null) {
          flattenConfig(item as NestedConfig, arrKey, result);
        } else {
          result[arrKey] = String(item ?? "");
        }
      });
    } else {
      result[fullKey] = String(value ?? "");
    }
  }
  return result;
}

/**
 * Unflatten dot-notation key/value pairs back into a nested object.
 */
export function unflattenConfig(flat: FlatConfig): NestedConfig {
  const result: NestedConfig = {};
  for (const [dotKey, value] of Object.entries(flat)) {
    const parts = dotKey.split(".");
    let cursor: Record<string, unknown> = result as Record<string, unknown>;
    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      if (cursor[part] === undefined || typeof cursor[part] !== "object") {
        cursor[part] = {};
      }
      cursor = cursor[part] as Record<string, unknown>;
    }
    cursor[parts[parts.length - 1]] = value;
  }
  return result;
}

/**
 * Return the set of top-level namespaces present in a flat config.
 */
export function extractNamespaces(flat: FlatConfig): string[] {
  const namespaces = new Set<string>();
  for (const key of Object.keys(flat)) {
    const dot = key.indexOf(".");
    namespaces.add(dot !== -1 ? key.slice(0, dot) : key);
  }
  return Array.from(namespaces).sort();
}
