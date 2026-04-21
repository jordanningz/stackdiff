import { interpolateValue, interpolateConfig } from "./interpolate";

describe("interpolateValue", () => {
  it("replaces a known reference", () => {
    const { result, resolved, unresolved } = interpolateValue(
      "https://${HOST}/api",
      { HOST: "example.com" }
    );
    expect(result).toBe("https://example.com/api");
    expect(resolved).toContain("HOST");
    expect(unresolved).toHaveLength(0);
  });

  it("replaces multiple references", () => {
    const { result } = interpolateValue("${PROTO}://${HOST}", {
      PROTO: "https",
      HOST: "example.com",
    });
    expect(result).toBe("https://example.com");
  });

  it("returns empty string for unresolved reference by default", () => {
    const { result, unresolved } = interpolateValue("${MISSING}", {});
    expect(result).toBe("");
    expect(unresolved).toContain("MISSING");
  });

  it("keeps unresolved reference when keepUnresolved is true", () => {
    const { result } = interpolateValue("${MISSING}", {}, true);
    expect(result).toBe("${MISSING}");
  });

  it("returns value unchanged when no references present", () => {
    const { result, resolved } = interpolateValue("plain-value", {});
    expect(result).toBe("plain-value");
    expect(resolved).toHaveLength(0);
  });
});

describe("interpolateConfig", () => {
  it("interpolates self-referencing variables", () => {
    const config = { BASE_URL: "https://${HOST}", HOST: "api.example.com" };
    const { config: out } = interpolateConfig(config);
    expect(out.BASE_URL).toBe("https://api.example.com");
    expect(out.HOST).toBe("api.example.com");
  });

  it("uses context variables for resolution", () => {
    const config = { URL: "${SCHEME}://${DOMAIN}" };
    const { config: out, resolved } = interpolateConfig(config, {
      context: { SCHEME: "https", DOMAIN: "example.com" },
    });
    expect(out.URL).toBe("https://example.com");
    expect(resolved).toContain("SCHEME");
    expect(resolved).toContain("DOMAIN");
  });

  it("tracks unresolved keys", () => {
    const config = { VAL: "${UNKNOWN}" };
    const { unresolved } = interpolateConfig(config);
    expect(unresolved).toContain("UNKNOWN");
  });

  it("does not mutate original config", () => {
    const config = { A: "${B}", B: "hello" };
    interpolateConfig(config);
    expect(config.A).toBe("${B}");
  });

  it("returns empty unresolved list when all refs resolve", () => {
    const config = { X: "${Y}", Y: "value" };
    const { unresolved } = interpolateConfig(config);
    expect(unresolved).toHaveLength(0);
  });
});
