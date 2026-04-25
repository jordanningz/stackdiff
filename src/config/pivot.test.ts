import { describe, it, expect } from "vitest";
import { pivotConfig, pivotBothConfigs, buildValueIndex } from "./pivot";

describe("pivotConfig", () => {
  it("swaps keys and values", () => {
    const result = pivotConfig({ FOO: "bar", BAZ: "qux" });
    expect(result.pivoted).toEqual({ bar: "FOO", qux: "BAZ" });
    expect(result.skipped).toEqual([]);
    expect(result.collisions).toEqual([]);
  });

  it("skips entries with empty values", () => {
    const result = pivotConfig({ FOO: "", BAR: "  ", BAZ: "val" });
    expect(result.skipped).toContain("FOO");
    expect(result.skipped).toContain("BAR");
    expect(result.pivoted).toEqual({ val: "BAZ" });
  });

  it("tracks collisions when two keys share a value", () => {
    const result = pivotConfig({ A: "same", B: "same", C: "unique" });
    expect(result.pivoted["same"]).toBe("A");
    expect(result.collisions).toContain("B");
    expect(result.pivoted["unique"]).toBe("C");
  });

  it("returns empty result for empty config", () => {
    const result = pivotConfig({});
    expect(result.pivoted).toEqual({});
    expect(result.skipped).toEqual([]);
    expect(result.collisions).toEqual([]);
  });
});

describe("pivotBothConfigs", () => {
  it("pivots staging and production independently", () => {
    const staging = { HOST: "localhost", PORT: "3000" };
    const production = { HOST: "prod.example.com", PORT: "443" };
    const result = pivotBothConfigs(staging, production);
    expect(result.staging.pivoted["localhost"]).toBe("HOST");
    expect(result.production.pivoted["prod.example.com"]).toBe("HOST");
  });
});

describe("buildValueIndex", () => {
  it("maps values to all keys that hold them across configs", () => {
    const a = { FOO: "shared", BAR: "only_a" };
    const b = { BAZ: "shared", QUX: "only_b" };
    const index = buildValueIndex([a, b]);
    expect(index["shared"]).toEqual(["FOO", "BAZ"]);
    expect(index["only_a"]).toEqual(["BAR"]);
    expect(index["only_b"]).toEqual(["QUX"]);
  });

  it("deduplicates keys that appear in multiple configs with same value", () => {
    const a = { KEY: "val" };
    const b = { KEY: "val" };
    const index = buildValueIndex([a, b]);
    expect(index["val"]).toEqual(["KEY"]);
  });

  it("ignores empty/falsy values", () => {
    const a = { EMPTY: "", PRESENT: "yes" };
    const index = buildValueIndex([a]);
    expect(index[""]).toBeUndefined();
    expect(index["yes"]).toEqual(["PRESENT"]);
  });
});
