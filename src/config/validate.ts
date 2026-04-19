export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export interface ValidationRule {
  key: string;
  required?: boolean;
  pattern?: RegExp;
  allowEmpty?: boolean;
}

export function validateConfig(
  config: Record<string, string>,
  rules: ValidationRule[]
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  for (const rule of rules) {
    const value = config[rule.key];

    if (rule.required && value === undefined) {
      errors.push(`Missing required key: ${rule.key}`);
      continue;
    }

    if (value === undefined) continue;

    if (!rule.allowEmpty && value.trim() === "") {
      warnings.push(`Empty value for key: ${rule.key}`);
    }

    if (rule.pattern && value && !rule.pattern.test(value)) {
      errors.push(`Invalid format for key: ${rule.key} (value: "${value}")`);
    }
  }

  return { valid: errors.length === 0, errors, warnings };
}

export function validateBothConfigs(
  staging: Record<string, string>,
  production: Record<string, string>,
  rules: ValidationRule[]
): { staging: ValidationResult; production: ValidationResult } {
  return {
    staging: validateConfig(staging, rules),
    production: validateConfig(production, rules),
  };
}
