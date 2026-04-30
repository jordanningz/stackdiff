export interface PrefixOptions {
  add?: string;
  remove?: string;
  replace?: { from: string; to: string };
}

export interface PrefixResult {
  original: Record<string, string>;
  transformed: Record<string, string>;
  changed: string[];
  skipped: string[];
}

export function prefixConfig(
  config: Record<string, string>,
  opts: PrefixOptions
): PrefixResult {
  const transformed: Record<string, string> = {};
  const changed: string[] = [];
  const skipped: string[] = [];

  for (const [key, value] of Object.entries(config)) {
    let newKey = key;

    if (opts.add) {
      newKey = `${opts.add}${key}`;
    } else if (opts.remove) {
      if (key.startsWith(opts.remove)) {
        newKey = key.slice(opts.remove.length);
      } else {
        skipped.push(key);
        transformed[key] = value;
        continue;
      }
    } else if (opts.replace) {
      if (key.startsWith(opts.replace.from)) {
        newKey = `${opts.replace.to}${key.slice(opts.replace.from.length)}`;
      } else {
        skipped.push(key);
        transformed[key] = value;
        continue;
      }
    }

    if (newKey !== key) changed.push(key);
    transformed[newKey] = value;
  }

  return { original: config, transformed, changed, skipped };
}

export function prefixBothConfigs(
  staging: Record<string, string>,
  production: Record<string, string>,
  opts: PrefixOptions
): { staging: PrefixResult; production: PrefixResult } {
  return {
    staging: prefixConfig(staging, opts),
    production: prefixConfig(production, opts),
  };
}

export function loadPrefixOptionsFromEnv(): PrefixOptions {
  const add = process.env.STACKDIFF_PREFIX_ADD;
  const remove = process.env.STACKDIFF_PREFIX_REMOVE;
  const from = process.env.STACKDIFF_PREFIX_REPLACE_FROM;
  const to = process.env.STACKDIFF_PREFIX_REPLACE_TO;

  if (add) return { add };
  if (remove) return { remove };
  if (from && to) return { replace: { from, to } };
  return {};
}
