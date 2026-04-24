import { promoteConfig, applyPromotion } from "./promote";

const source = { API_URL: "https://api.prod.com", DB_PASS: "secret", NEW_KEY: "new" };
const target = { API_URL: "https://api.staging.com", DB_PASS: "old-secret" };

describe("promoteConfig", () => {
  it("promotes all source keys by default", () => {
    const result = promoteConfig(source, target, { overwrite: true });
    expect(Object.keys(result.promoted)).toEqual(["API_URL", "DB_PASS", "NEW_KEY"]);
    expect(result.skipped).toEqual({});
  });

  it("skips existing target keys without overwrite", () => {
    const result = promoteConfig(source, target);
    expect(result.skipped["API_URL"]).toMatch(/already exists/);
    expect(result.skipped["DB_PASS"]).toMatch(/already exists/);
    expect(result.promoted["NEW_KEY"]).toBeDefined();
  });

  it("promotes only specified keys", () => {
    const result = promoteConfig(source, target, { keys: ["API_URL"], overwrite: true });
    expect(Object.keys(result.promoted)).toEqual(["API_URL"]);
  });

  it("skips keys not present in source", () => {
    const result = promoteConfig(source, target, { keys: ["MISSING_KEY"] });
    expect(result.skipped["MISSING_KEY"]).toMatch(/not found in source/);
  });

  it("records dry run flag", () => {
    const result = promoteConfig(source, target, { dryRun: true, overwrite: true });
    expect(result.dryRun).toBe(true);
  });
});

describe("applyPromotion", () => {
  it("applies promoted keys to target", () => {
    const result = promoteConfig(source, target, { overwrite: true });
    const updated = applyPromotion(source, target, result);
    expect(updated["API_URL"]).toBe("https://api.prod.com");
    expect(updated["NEW_KEY"]).toBe("new");
  });

  it("does not mutate target on dry run", () => {
    const result = promoteConfig(source, target, { dryRun: true, overwrite: true });
    const updated = applyPromotion(source, target, result);
    expect(updated["API_URL"]).toBe("https://api.staging.com");
    expect(updated["NEW_KEY"]).toBeUndefined();
  });
});
