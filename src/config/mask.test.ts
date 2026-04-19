import { maskConfig, getMaskedKeys, isSensitiveKey, maskValue } from "./mask";

const sampleConfig = {
  DATABASE_URL: "postgres://localhost/db",
  API_KEY: "abc123",
  APP_NAME: "myapp",
  SECRET_TOKEN: "supersecret",
  PORT: "3000",
  AUTH_PASSWORD: "hunter2",
};

describe("isSensitiveKey", () => {
  it("matches default sensitive patterns", () => {
    expect(isSensitiveKey("API_KEY", [/api_key/i])).toBe(true);
    expect(isSensitiveKey("APP_NAME", [/api_key/i])).toBe(false);
  });
});

describe("maskValue", () => {
  it("replaces value with placeholder", () => {
    expect(maskValue("secret123", "***")).toBe("***");
    expect(maskValue("", "[hidden]")).toBe("[hidden]");
  });
});

describe("maskConfig", () => {
  it("masks sensitive keys with default patterns", () => {
    const masked = maskConfig(sampleConfig);
    expect(masked["API_KEY"]).toBe("***");
    expect(masked["SECRET_TOKEN"]).toBe("***");
    expect(masked["AUTH_PASSWORD"]).toBe("***");
    expect(masked["APP_NAME"]).toBe("myapp");
    expect(masked["PORT"]).toBe("3000");
  });

  it("uses custom placeholder", () => {
    const masked = maskConfig(sampleConfig, { placeholder: "[REDACTED]" });
    expect(masked["API_KEY"]).toBe("[REDACTED]");
  });

  it("merges custom patterns with defaults", () => {
    n      { DATABASE_URL: "postgres://...", APP_NAME: "myapp" },
      { patterns: [/database_url/i] }
    );
    expect(masked["DATABASE_URL"]).toBe("***");
    expect(masked["APP_NAME"]).toBe("myapp");
  });

  it("uses only custom patterns when includeDefaults=false", () => {
    const masked = maskConfig(sampleConfig, {
      patterns: [/database_url/i],
      includeDefaults: false,
    });
    expect(masked["API_KEY"]).toBe("abc123");
  });
});

describe("getMaskedKeys", () => {
  it("returns list of sensitive keys", () => {
    const keys = getMaskedKeys(sampleConfig);
    expect(keys).toContain("API_KEY");
    expect(keys).toContain("SECRET_TOKEN");
    expect(keys).toContain("AUTH_PASSWORD");
    expect(keys).not.toContain("APP_NAME");
  });
});
