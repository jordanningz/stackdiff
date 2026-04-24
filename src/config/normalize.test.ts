import {
  normalizeValue,
  normalizeKey,
  normalizeConfig,
  normalizeBothConfigs,
  loadNormalizeOptionsFromEnv,
} from "./normalize";

describe("normalizeValue", () => {
  it("trims whitespace when trimValues is true", () => {
    expect(normalizeValue("  hello  ", { trimValues: true })).toBe("hello");
  });

  it("does not trim when trimValues is false", () => {
    expect(normalizeValue("  hello  ", { trimValues: false })).toBe("  hello  ");
  });

  it("collapses internal whitespace", () => {
    expect(normalizeValue("foo   bar", { collapseWhitespace: true })).toBe("foo bar");
  });

  it("normalizes boolean-like strings to true", () => {
    for (const v of ["1", "yes", "on", "TRUE"]) {
      expect(normalizeValue(v, { normalizeBoolean: true })).toBe("true");
    }
  });

  it("normalizes boolean-like strings to false", () => {
    for (const v of ["0", "no", "off", "FALSE"]) {
      expect(normalizeValue(v, { normalizeBoolean: true })).toBe("false");
    }
  });

  it("leaves non-boolean strings unchanged when normalizeBoolean is true", () => {
    expect(normalizeValue("hello", { normalizeBoolean: true })).toBe("hello");
  });
});

describe("normalizeKey", () => {
  it("uppercases key when uppercaseKeys is true", () => {
    expect(normalizeKey("my_key", { uppercaseKeys: true })).toBe("MY_KEY");
  });

  it("lowercases key when lowercaseKeys is true", () => {
    expect(normalizeKey("MY_KEY", { lowercaseKeys: true })).toBe("my_key");
  });

  it("returns key unchanged when no option set", () => {
    expect(normalizeKey("My_Key", {})).toBe("My_Key");
  });
});

describe("normalizeConfig", () => {
  it("applies options to all entries", () => {
    const config = { MY_KEY: "  value  ", FLAG: "yes" };
    const result = normalizeConfig(config, { trimValues: true, normalizeBoolean: true });
    expect(result).toEqual({ MY_KEY: "value", FLAG: "true" });
  });

  it("uppercases all keys", () => {
    const config = { api_url: "http://example.com" };
    expect(normalizeConfig(config, { uppercaseKeys: true })).toEqual({
      API_URL: "http://example.com",
    });
  });
});

describe("normalizeBothConfigs", () => {
  it("normalizes staging and production independently", () => {
    const staging = { key: "  a  " };
    const production = { key: "  b  " };
    const result = normalizeBothConfigs(staging, production, { trimValues: true });
    expect(result.staging).toEqual({ key: "a" });
    expect(result.production).toEqual({ key: "b" });
  });
});

describe("loadNormalizeOptionsFromEnv", () => {
  it("returns trimValues true by default", () => {
    delete process.env.NORMALIZE_TRIM;
    const opts = loadNormalizeOptionsFromEnv();
    expect(opts.trimValues).toBe(true);
  });

  it("respects NORMALIZE_BOOLEAN env var", () => {
    process.env.NORMALIZE_BOOLEAN = "true";
    const opts = loadNormalizeOptionsFromEnv();
    expect(opts.normalizeBoolean).toBe(true);
    delete process.env.NORMALIZE_BOOLEAN;
  });
});
