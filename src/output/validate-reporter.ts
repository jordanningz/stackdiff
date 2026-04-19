import { ValidationResult } from "../config/validate";
import { red, yellow, green, dim } from "./color";

export function reportValidation(
  env: string,
  result: ValidationResult
): string {
  const lines: string[] = [];
  const label = dim(`[${env}]`);

  if (result.valid && result.warnings.length === 0) {
    lines.push(`${label} ${green("✔")} All checks passed`);
    return lines.join("\n");
  }

  if (!result.valid) {
    lines.push(`${label} ${red("✖")} Validation failed`);
    for (const err of result.errors) {
      lines.push(`  ${red("error")}  ${err}`);
    }
  }

  for (const warn of result.warnings) {
    lines.push(`  ${yellow("warn")}   ${warn}`);
  }

  return lines.join("\n");
}

export function reportBothValidations(
  stagingResult: ValidationResult,
  productionResult: ValidationResult
): void {
  console.log(reportValidation("staging", stagingResult));
  console.log(reportValidation("production", productionResult));

  const allValid = stagingResult.valid && productionResult.valid;
  const totalErrors = stagingResult.errors.length + productionResult.errors.length;
  const totalWarnings = stagingResult.warnings.length + productionResult.warnings.length;

  console.log("");
  if (allValid) {
    console.log(green(`✔ Validation passed (${totalWarnings} warning(s))`));
  } else {
    console.log(red(`✖ Validation failed with ${totalErrors} error(s), ${totalWarnings} warning(s)`));
    process.exit(1);
  }
}
