import { EnvConfig } from './loader';

export type AuditSeverity = 'error' | 'warn' | 'info';

export interface AuditEntry {
  key: string;
  severity: AuditSeverity;
  message: string;
  source: 'staging' | 'production' | 'both';
}

export interface AuditResult {
  entries: AuditEntry[];
  errorCount: number;
  warnCount: number;
  infoCount: number;
}

const REQUIRED_KEYS = (process.env.AUDIT_REQUIRED_KEYS ?? '')
  .split(',')
  .map((k) => k.trim())
  .filter(Boolean);

const FORBIDDEN_PATTERNS = [/password/i, /secret/i, /private_key/i];

export function auditConfig(
  config: EnvConfig,
  source: 'staging' | 'production'
): AuditEntry[] {
  const entries: AuditEntry[] = [];

  for (const key of REQUIRED_KEYS) {
    if (!(key in config)) {
      entries.push({ key, severity: 'error', message: `Required key "${key}" is missing`, source });
    }
  }

  for (const [key, value] of Object.entries(config)) {
    if (value === '') {
      entries.push({ key, severity: 'warn', message: `Key "${key}" has an empty value`, source });
    }
    for (const pattern of FORBIDDEN_PATTERNS) {
      if (pattern.test(key) && value && value.length < 8) {
        entries.push({ key, severity: 'warn', message: `Sensitive key "${key}" has a suspiciously short value`, source });
      }
    }
  }

  return entries;
}

export function auditBothConfigs(
  staging: EnvConfig,
  production: EnvConfig
): AuditResult {
  const entries = [
    ...auditConfig(staging, 'staging'),
    ...auditConfig(production, 'production'),
  ];

  return {
    entries,
    errorCount: entries.filter((e) => e.severity === 'error').length,
    warnCount: entries.filter((e) => e.severity === 'warn').length,
    infoCount: entries.filter((e) => e.severity === 'info').length,
  };
}
