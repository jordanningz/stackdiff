import {
  annotateConfig,
  annotateBothConfigs,
  loadAnnotationsFromEnv,
  mergeAnnotations,
} from "./annotate";

describe("annotateConfig", () => {
  const config = { API_URL: "https://api.example.com", DB_PASS: "secret", PORT: "3000" };

  it("attaches annotations for keys that exist in config", () => {
    const result = annotateConfig(config, { API_URL: "Primary API endpoint", PORT: "HTTP port" });
    expect(result.annotations).toEqual({ API_URL: "Primary API endpoint", PORT: "HTTP port" });
  });

  it("ignores annotations for keys not in config", () => {
    const result = annotateConfig(config, { MISSING_KEY: "should be ignored" });
    expect(result.annotations).toEqual({});
  });

  it("preserves the original config unchanged", () => {
    const result = annotateConfig(config, { DB_PASS: "sensitive" });
    expect(result.config).toEqual(config);
  });

  it("returns empty annotations when none provided", () => {
    const result = annotateConfig(config, {});
    expect(result.annotations).toEqual({});
  });
});

describe("annotateBothConfigs", () => {
  it("annotates staging and production independently", () => {
    const staging = { HOST: "staging.example.com" };
    const production = { HOST: "prod.example.com", EXTRA: "val" };
    const annotations = { HOST: "hostname", EXTRA: "extra note" };
    const result = annotateBothConfigs(staging, production, annotations);
    expect(result.staging.annotations).toEqual({ HOST: "hostname" });
    expect(result.production.annotations).toEqual({ HOST: "hostname", EXTRA: "extra note" });
  });
});

describe("loadAnnotationsFromEnv", () => {
  it("reads annotations from env vars with STACKDIFF_ANNOTATE_ prefix", () => {
    const env = {
      STACKDIFF_ANNOTATE_API_URL: "endpoint",
      STACKDIFF_ANNOTATE_PORT: "port number",
      UNRELATED: "ignored",
    };
    const result = loadAnnotationsFromEnv(env);
    expect(result).toEqual({ API_URL: "endpoint", PORT: "port number" });
  });

  it("returns empty object when no matching env vars", () => {
    expect(loadAnnotationsFromEnv({})).toEqual({});
  });
});

describe("mergeAnnotations", () => {
  it("merges base and overrides with overrides winning", () => {
    const base = { A: "note A", B: "note B" };
    const overrides = { B: "new note B", C: "note C" };
    expect(mergeAnnotations(base, overrides)).toEqual({ A: "note A", B: "new note B", C: "note C" });
  });
});
