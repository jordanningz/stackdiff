// cast.ts — coerce env var string values to typed primitives

export type CastType = 'string' | 'number' | 'boolean' | 'json' | 'auto';

export interface CastOptions {
  type?: CastType;
  strict?: boolean;
}

export interface CastResult {
  key: string;
  original: string;
  casted: unknown;
  type: CastType;
  error?: string;
}

export interface CastConfigResult {
  values: Record<string, unknown>;
  entries: CastResult[];
  errors: CastResult[];
}

export function castValue(value: string, type: CastType = 'auto'): { casted: unknown; resolved: CastType; error?: string } {
  if (type === 'string') return { casted: value, resolved: 'string' };

  if (type === 'boolean') {
    const lower = value.toLowerCase();
    if (lower === 'true' || lower === '1' || lower === 'yes') return { casted: true, resolved: 'boolean' };
    if (lower === 'false' || lower === '0' || lower === 'no') return { casted: false, resolved: 'boolean' };
    return { casted: value, resolved: 'boolean', error: `Cannot cast "${value}" to boolean` };
  }

  if (type === 'number') {
    const n = Number(value);
    if (!isNaN(n)) return { casted: n, resolved: 'number' };
    return { casted: value, resolved: 'number', error: `Cannot cast "${value}" to number` };
  }

  if (type === 'json') {
    try {
      return { casted: JSON.parse(value), resolved: 'json' };
    } catch {
      return { casted: value, resolved: 'json', error: `Cannot parse "${value}" as JSON` };
    }
  }

  // auto
  if (value === 'true') return { casted: true, resolved: 'auto' };
  if (value === 'false') return { casted: false, resolved: 'auto' };
  const n = Number(value);
  if (value !== '' && !isNaN(n)) return { casted: n, resolved: 'auto' };
  try { return { casted: JSON.parse(value), resolved: 'auto' }; } catch { /* not json */ }
  return { casted: value, resolved: 'auto' };
}

export function castConfig(
  config: Record<string, string>,
  typeMap: Record<string, CastType> = {},
  options: CastOptions = {}
): CastConfigResult {
  const entries: CastResult[] = [];
  const values: Record<string, unknown> = {};

  for (const [key, raw] of Object.entries(config)) {
    const type = typeMap[key] ?? options.type ?? 'auto';
    const { casted, resolved, error } = castValue(raw, type);
    const entry: CastResult = { key, original: raw, casted, type: resolved, error };
    entries.push(entry);
    values[key] = error && options.strict ? raw : casted;
  }

  return { values, entries, errors: entries.filter(e => !!e.error) };
}

export function loadCastMapFromEnv(env: Record<string, string | undefined> = process.env): Record<string, CastType> {
  const raw = env['STACKDIFF_CAST_MAP'] ?? '';
  const map: Record<string, CastType> = {};
  for (const part of raw.split(',').filter(Boolean)) {
    const [key, type] = part.split(':');
    if (key && type) map[key.trim()] = type.trim() as CastType;
  }
  return map;
}
