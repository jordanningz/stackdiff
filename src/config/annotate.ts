/**
 * annotate.ts — attach inline comments/annotations to config keys
 */

export interface Annotation {
  key: string;
  note: string;
}

export interface AnnotatedConfig {
  config: Record<string, string>;
  annotations: Record<string, string>;
}

export function annotateConfig(
  config: Record<string, string>,
  annotations: Record<string, string>
): AnnotatedConfig {
  const validKeys = Object.keys(annotations).filter((k) => k in config);
  const filtered: Record<string, string> = {};
  for (const k of validKeys) {
    filtered[k] = annotations[k];
  }
  return { config, annotations: filtered };
}

export function annotateBothConfigs(
  staging: Record<string, string>,
  production: Record<string, string>,
  annotations: Record<string, string>
): { staging: AnnotatedConfig; production: AnnotatedConfig } {
  return {
    staging: annotateConfig(staging, annotations),
    production: annotateConfig(production, annotations),
  };
}

export function loadAnnotationsFromEnv(
  env: Record<string, string> = process.env as Record<string, string>
): Record<string, string> {
  const prefix = "STACKDIFF_ANNOTATE_";
  const result: Record<string, string> = {};
  for (const [k, v] of Object.entries(env)) {
    if (k.startsWith(prefix) && v) {
      const key = k.slice(prefix.length);
      result[key] = v;
    }
  }
  return result;
}

export function mergeAnnotations(
  base: Record<string, string>,
  overrides: Record<string, string>
): Record<string, string> {
  return { ...base, ...overrides };
}
