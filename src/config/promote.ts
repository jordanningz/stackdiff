import { EnvConfig } from "./loader";

export interface PromoteOptions {
  keys?: string[];
  overwrite?: boolean;
  dryRun?: boolean;
}

export interface PromoteResult {
  promoted: Record<string, { from: string; to: string | undefined }>;
  skipped: Record<string, string>;
  dryRun: boolean;
}

export function promoteConfig(
  source: EnvConfig,
  target: EnvConfig,
  options: PromoteOptions = {}
): PromoteResult {
  const { keys, overwrite = false, dryRun = false } = options;
  const candidates = keys ? keys : Object.keys(source);

  const promoted: PromoteResult["promoted"] = {};
  const skipped: Record<string, string> = {};

  for (const key of candidates) {
    if (!(key in source)) {
      skipped[key] = "key not found in source";
      continue;
    }
    if (key in target && !overwrite) {
      skipped[key] = "key already exists in target (use --overwrite to replace)";
      continue;
    }
    promoted[key] = { from: source[key], to: target[key] };
  }

  return { promoted, skipped, dryRun };
}

export function applyPromotion(
  source: EnvConfig,
  target: EnvConfig,
  result: PromoteResult
): EnvConfig {
  if (result.dryRun) return { ...target };
  const updated = { ...target };
  for (const key of Object.keys(result.promoted)) {
    updated[key] = source[key];
  }
  return updated;
}
