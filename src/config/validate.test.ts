import { validateConfig, validateBothConfigs } from "./validate";

const rules = [
  { key: "DATABASE_URL", required: true, pattern: /^postgres:\/\// },
  { key: "PORT", required: false, pattern: /^\d+$/ },
  { key: "API_KEY", required: true, allowEmpty: false },
];

describe("validateConfig", () => {
  it("passes with valid config", () => {
    const result = validateConfig(
      { DATABASE_URL: "postgres://localhost/db", API_KEY: "secret" },
      rules
    );
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it("errors on missing required key", () => {
    const result = validateConfig({ API_KEY: "x" }, rules);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Missing required key: DATABASE_URL");
  });

  it("errors on pattern mismatch", () => {
    const result = validateConfig(
      { DATABASE_URL: "mysql://localhost", API_KEY: "x" },
      rules
    );
    expect(result.valid).toBe(false);
    expect(result.errors[0]).toMatch(/Invalid format for key: DATABASE_URL/);
  });

  it("warns on empty value", () => {
    const result = validateConfig(
      { DATABASE_URL: "postgres://localhost/db", API_KEY: "" },
      rules
    );
    expect(result.warnings).toContain("Empty value for key: API_KEY");
  });

  it("warns on invalid PORT pattern", () => {
    const result = validateConfig(
      { DATABASE_URL: "postgres://localhost/db", API_KEY: "k", PORT: "abc" },
      rules
    );
    expect(result.errors[0]).toMatch(/Invalid format for key: PORT/);
  });
});

describe("validateBothConfigs", () => {
  it("returns results for both environments", () => {
    const result = validateBothConfigs(
      { DATABASE_URL: "postgres://s/db", API_KEY: "s" },
      { DATABASE_URL: "postgres://p/db", API_KEY: "p" },
      rules
    );
    expect(result.staging.valid).toBe(true);
    expect(result.production.valid).toBe(true);
  });
});
