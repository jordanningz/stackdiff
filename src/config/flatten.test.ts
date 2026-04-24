import { describe, it, expect } from "vitest";
import { flattenConfig, unflattenConfig, extractNamespaces } from "./flatten";

describe("flattenConfig", () => {
  it("returns flat object unchanged (no nesting)", () => {
    const input = { FOO: "bar", BAZ: "qux" };
    expect(flattenConfig(input)).toEqual({ FOO: "bar", BAZ: "qux" });
  });

  it("flattens one level of nesting", () => {
    const input = { db: { host: "localhost", port: "5432" } };
    expect(flattenConfig(input)).toEqual({
      "db.host": "localhost",
      "db.port": "5432",
    });
  });

  it("flattens multiple levels of nesting", () => {
    const input = { a: { b: { c: "deep" } } };
    expect(flattenConfig(input)).toEqual({ "a.b.c": "deep" });
  });

  it("converts non-string leaf values to strings", () => {
    const input = { count: 42, flag: true, nothing: null };
    expect(flattenConfig(input)).toEqual({
      count: "42",
      flag: "true",
      nothing: "",
    });
  });

  it("flattens array values with index notation", () => {
    const input = { tags: ["a", "b"] };
    expect(flattenConfig(input)).toEqual({
      "tags[0]": "a",
      "tags[1]": "b",
    });
  });
});

describe("unflattenConfig", () => {
  it("restores a nested object from dot-notation keys", () => {
    const flat = { "db.host": "localhost", "db.port": "5432" };
    expect(unflattenConfig(flat)).toEqual({
      db: { host: "localhost", port: "5432" },
    });
  });

  it("handles top-level keys without dots", () => {
    const flat = { FOO: "bar" };
    expect(unflattenConfig(flat)).toEqual({ FOO: "bar" });
  });

  it("round-trips through flatten then unflatten", () => {
    const original = { service: { name: "api", version: "1.0" }, debug: "false" };
    const flat = flattenConfig(original);
    const restored = unflattenConfig(flat);
    expect(restored).toEqual({ service: { name: "api", version: "1.0" }, debug: "false" });
  });
});

describe("extractNamespaces", () => {
  it("returns unique top-level namespaces sorted", () => {
    const flat = {
      "db.host": "localhost",
      "db.port": "5432",
      "cache.ttl": "300",
      TOP_LEVEL: "value",
    };
    expect(extractNamespaces(flat)).toEqual(["TOP_LEVEL", "cache", "db"]);
  });

  it("returns empty array for empty config", () => {
    expect(extractNamespaces({})).toEqual([]);
  });
});
