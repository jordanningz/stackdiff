import { describe, it, expect } from "vitest";
import {
  findDuplicateValues,
  dedupeConfig,
  dedupeBothConfigs,
} from "./dedupe";

describe("findDuplicateValues", () => {
  it("returns empty array when no duplicates", () => {
    const config = { A: "foo", B: "bar", C: "baz" };
    expect(findDuplicateValues(config)).toEqual([]);
  });

  it("detects duplicate values", () => {
    const config = { A: "same", B: "other", C: "same" };
    const result = findDuplicateValues(config);
    expect(result).toHaveLength(1);
    expect(result[0].value).toBe("same");
    expect(result[0].keys).toContain("A");
    expect(result[0].keys).toContain("C");
  });

  it("respects caseSensitive=false", () => {
    const config = { A: "Hello", B: "hello" };
    expect(findDuplicateValues(config, false)).toHaveLength(1);
    expect(findDuplicateValues(config, true)).toHaveLength(0);
  });
});

describe("dedupeConfig", () => {
  it("returns original config when byValue=false", () => {
    const config = { A: "x", B: "x" };
    const result = dedupeConfig(config, { byValue: false });
    expect(result.unique).toEqual(config);
    expect(result.removed).toEqual([]);
  });

  it("removes duplicate value keys keeping first alphabetically", () => {
    const config = { B: "dup", A: "dup", C: "unique" };
    const result = dedupeConfig(config);
    expect(result.unique).toHaveProperty("A", "dup");
    expect(result.unique).not.toHaveProperty("B");
    expect(result.unique).toHaveProperty("C", "unique");
    expect(result.removed).toEqual(["B"]);
  });

  it("reports duplicates correctly", () => {
    const config = { X: "val", Y: "val", Z: "other" };
    const result = dedupeConfig(config);
    expect(result.duplicates).toHaveLength(1);
    expect(result.duplicates[0].value).toBe("val");
  });

  it("handles empty config", () => {
    const result = dedupeConfig({});
    expect(result.unique).toEqual({});
    expect(result.removed).toEqual([]);
    expect(result.duplicates).toEqual([]);
  });
});

describe("dedupeBothConfigs", () => {
  it("dedupes both configs independently", () => {
    const staging = { A: "dup", B: "dup" };
    const production = { C: "val", D: "other" };
    const result = dedupeBothConfigs(staging, production);
    expect(result.staging.removed).toHaveLength(1);
    expect(result.production.removed).toHaveLength(0);
  });
});
