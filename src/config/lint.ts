import { EnvConfig } from './loader';

export type LintSeverity = 'error' | 'warn' | 'info';

export interface LintRule {
  name: string;
  severity: LintSeverity;
  check: (key: string, value: string) => string | null;
}

export interface LintEntry {
  key: string;
  rule: string;
  severity: LintSeverity;
  message: string;
}

export interface LintResult {
  entries: LintEntry[];
  errorCount: number;
  warnCount: number;
  infoCount: number;
}

const builtinRules: LintRule[] = [
  {
    name: 'no-empty-value',
    severity: 'warn',
    check: (key, value) =>
      value.trim() === '' ? `Key "${key}" has an empty value` : null,
  },
  {
    name: 'no-trailing-whitespace',
    severity: 'info',
    check: (key, value) =>
      value !== value.trim() ? `Key "${key}" has trailing whitespace` : null,
  },
  {
    name: 'uppercase-key',
    severity: 'warn',
    check: (key) =>
      key !== key.toUpperCase() ? `Key "${key}" should be uppercase` : null,
  },
  {
    name: 'no-url-with-credentials',
    severity: 'error',
    check: (key, value) =>
      /https?:\/\/[^@]+:[^@]+@/.test(value)
        ? `Key "${key}" contains a URL with embedded credentials`
        : null,
  },
  {
    name: 'no-localhost-in-value',
    severity: 'warn',
    check: (key, value) =>
      /localhost|127\.0\.0\.1/.test(value)
        ? `Key "${key}" references localhost — may not be suitable for production`
        : null,
  },
];

export function lintConfig(
  config: EnvConfig,
  extraRules: LintRule[] = []
): LintResult {
  const rules = [...builtinRules, ...extraRules];
  const entries: LintEntry[] = [];

  for (const [key, value] of Object.entries(config)) {
    for (const rule of rules) {
      const message = rule.check(key, value);
      if (message) {
        entries.push({ key, rule: rule.name, severity: rule.severity, message });
      }
    }
  }

  return {
    entries,
    errorCount: entries.filter((e) => e.severity === 'error').length,
    warnCount: entries.filter((e) => e.severity === 'warn').length,
    infoCount: entries.filter((e) => e.severity === 'info').length,
  };
}

export function lintBothConfigs(
  staging: EnvConfig,
  production: EnvConfig,
  extraRules: LintRule[] = []
): { staging: LintResult; production: LintResult } {
  return {
    staging: lintConfig(staging, extraRules),
    production: lintConfig(production, extraRules),
  };
}
