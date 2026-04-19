import { diffConfigs, filterDiff } from "./diff";

const staging = {
  API_URL: "https://staging.api.example.com",
  DB_HOST: "staging-db.internal",
  LOG_LEVEL: "debug",
  ONLY_STAGING: "true",
};

const production = {
  API_URL: "https://api.example.com",
  DB_HOST: "staging-db.internal",
  LOG_LEVEL: "info",
  ONLY_PRODUCTION: "true",
};

describe("diffConfigs", () => {
  const result = diffConfigs(staging, production);

  it("detects changed values", () => {
    const changed = result.filter((e) => e.status === "changed");
    expect(changed.map((e) => e.key)).toEqual(expect.arrayContaining(["API_URL", "LOG_LEVEL"]));
  });

  it("detects unchanged values", () => {
    const unchanged = result.filter((e) => e.status === "unchanged");
    expect(unchanged.map((e) => e.key)).toContain("DB_HOST");
  });

  it("detects keys only in staging as removed", () => {
    const removed = result.filter((e) => e.status === "removed");
    expect(removed.map((e) => e.key)).toContain("ONLY_STAGING");
  });

  it("detects keys only in production as added", () => {
    const added = result.filter((e) => e.status === "added");
    expect(added.map((e) => e.key)).toContain("ONLY_PRODUCTION");
  });

  it("returns sorted keys", () => {
    const keys = result.map((e) => e.key);
    expect(keys).toEqual([...keys].sort());
  });
});

describe("filterDiff", () => {
  const result = diffConfigs(staging, production);

  it("filters to only specified statuses", () => {
    const filtered = filterDiff(result, ["added", "removed"]);
    const statuses = new Set(filtered.map((e) => e.status));
    expect(statuses.has("changed")).toBe(false);
    expect(statuses.has("unchanged")).toBe(false);
  });

  it("returns empty array when no matches", () => {
    const filtered = filterDiff(result, []);
    expect(filtered).toHaveLength(0);
  });
});
