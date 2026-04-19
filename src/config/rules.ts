import { ValidationRule } from "./validate";

export const defaultRules: ValidationRule[] = [
  { key: "NODE_ENV", required: true, pattern: /^(development|staging|production|test)$/ },
  { key: "DATABASE_URL", required: true, pattern: /^(postgres|mysql|mongodb):\/\// },
  { key: "PORT", required: false, pattern: /^\d{2,5}$/ },
  { key: "LOG_LEVEL", required: false, pattern: /^(debug|info|warn|error)$/ },
  { key: "SECRET_KEY", required: true, allowEmpty: false },
  { key: "API_BASE_URL", required: false, pattern: /^https?:\/\// },
  { key: "REDIS_URL", required: false, pattern: /^redis:\/\// },
];

export function loadRulesFromEnv(
  requiredKeys: string[],
  optionalKeys: string[] = []
): ValidationRule[] {
  const required: ValidationRule[] = requiredKeys.map((key) => ({
    key,
    required: true,
    allowEmpty: false,
  }));

  const optional: ValidationRule[] = optionalKeys.map((key) => ({
    key,
    required: false,
    allowEmpty: true,
  }));

  return [...required, ...optional];
}

export function mergeRules(
  base: ValidationRule[],
  overrides: ValidationRule[]
): ValidationRule[] {
  const map = new Map<string, ValidationRule>();
  for (const rule of base) map.set(rule.key, rule);
  for (const rule of overrides) map.set(rule.key, { ...map.get(rule.key), ...rule });
  return Array.from(map.values());
}
