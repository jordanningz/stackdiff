/**
 * Interpolate variable references within config values.
 * Supports ${VAR_NAME} syntax, resolving from the same config or a provided context.
 */

export interface InterpolateOptions {
  /** Additional context variables to resolve references from */
  context?: Record<string, string>;
  /** If true, unresolved references are left as-is; otherwise they become empty string */
  keepUnresolved?: boolean;
}

export interface InterpolateResult {
  config: Record<string, string>;
  resolved: string[];
  unresolved: string[];
}

const REF_PATTERN = /\$\{([A-Z_][A-Z0-9_]*)\}/g;

export function interpolateValue(
  value: string,
  lookup: Record<string, string>,
  keepUnresolved = false
): { result: string; resolved: string[]; unresolved: string[] } {
  const resolved: string[] = [];
  const unresolved: string[] = [];

  const result = value.replace(REF_PATTERN, (match, key: string) => {
    if (Object.prototype.hasOwnProperty.call(lookup, key)) {
      resolved.push(key);
      return lookup[key];
    }
    unresolved.push(key);
    return keepUnresolved ? match : "";
  });

  return { result, resolved, unresolved };
}

export function interpolateConfig(
  config: Record<string, string>,
  options: InterpolateOptions = {}
): InterpolateResult {
  const { context = {}, keepUnresolved = false } = options;
  const lookup: Record<string, string> = { ...config, ...context };

  const output: Record<string, string> = {};
  const allResolved = new Set<string>();
  const allUnresolved = new Set<string>();

  for (const [key, value] of Object.entries(config)) {
    const { result, resolved, unresolved } = interpolateValue(
      value,
      lookup,
      keepUnresolved
    );
    output[key] = result;
    resolved.forEach((r) => allResolved.add(r));
    unresolved.forEach((u) => allUnresolved.add(u));
  }

  return {
    config: output,
    resolved: Array.from(allResolved),
    unresolved: Array.from(allUnresolved),
  };
}
