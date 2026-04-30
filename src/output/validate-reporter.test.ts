import { reportValidation } from "./validate-reporter";

const passing: import("../config/validate").ValidationResult = {
  valid: true,
  errors: [],
  warnings: [],
};

const failing: import("../config/validate").ValidationResult = {
  valid: false,
  errors: ["Missing required key: DATABASE_URL"],
  warnings: ["Empty value for key: API_KEY"],
};

describe("reportValidation", () => {
  it("reports success for passing result", () => {
    const output = reportValidation("staging", passing);
    expect(output).toContain("All checks passed");
    expect(output).toContain("staging");
  });

  it("reports errors for failing result", () => {
    const output = reportValidation("production", failing);
    expect(output).toContain("Validation failed");
    expect(output).toContain("Missing required key: DATABASE_URL");
  });

  it("includes warnings in output", () => {
    const output = reportValidation("staging", failing);
    expect(output).toContain("Empty value for key: API_KEY");
  });

  it("does not show error block when valid with warnings", () => {
    const withWarning: import("../config/validate").ValidationResult = {
      valid: true,
      errors: [],
      warnings: ["Empty value for key: OPTIONAL"],
    };
    const output = reportValidation("staging", withWarning);
    expect(output).not.toContain("Validation failed");
    expect(output).toContain("Empty value for key: OPTIONAL");
  });

  it("does not show warnings block when there are no warnings", () => {
    const output = reportValidation("staging", passing);
    expect(output).not.toContain("Warning");
  });
});
