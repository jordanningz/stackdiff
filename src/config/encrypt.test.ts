import {
  encryptValue,
  decryptValue,
  isEncrypted,
  encryptConfig,
  decryptConfig,
  encryptBothConfigs,
} from "./encrypt";

const SECRET = "test-secret-key";

describe("isEncrypted", () => {
  it("returns true for encrypted values", () => {
    const enc = encryptValue("hello", SECRET);
    expect(isEncrypted(enc)).toBe(true);
  });

  it("returns false for plain values", () => {
    expect(isEncrypted("plain")).toBe(false);
    expect(isEncrypted("")).toBe(false);
  });
});

describe("encryptValue / decryptValue", () => {
  it("round-trips a value", () => {
    const enc = encryptValue("my-secret", SECRET);
    expect(enc).toMatch(/^enc:/);
    expect(decryptValue(enc, SECRET)).toBe("my-secret");
  });

  it("produces different ciphertext each call (random IV)", () => {
    const a = encryptValue("same", SECRET);
    const b = encryptValue("same", SECRET);
    expect(a).not.toBe(b);
  });

  it("throws on invalid format", () => {
    expect(() => decryptValue("enc:bad", SECRET)).toThrow();
  });

  it("throws on non-encrypted value", () => {
    expect(() => decryptValue("plain", SECRET)).toThrow();
  });
});

describe("encryptConfig", () => {
  it("encrypts all values when no keys specified", () => {
    const result = encryptConfig({ A: "1", B: "2" }, SECRET);
    expect(isEncrypted(result.A)).toBe(true);
    expect(isEncrypted(result.B)).toBe(true);
  });

  it("encrypts only specified keys", () => {
    const result = encryptConfig({ A: "1", B: "2" }, SECRET, ["A"]);
    expect(isEncrypted(result.A)).toBe(true);
    expect(isEncrypted(result.B)).toBe(false);
  });

  it("skips already-encrypted values", () => {
    const enc = encryptValue("1", SECRET);
    const result = encryptConfig({ A: enc }, SECRET);
    expect(result.A).toBe(enc);
  });
});

describe("decryptConfig", () => {
  it("decrypts only encrypted values", () => {
    const enc = encryptValue("secret", SECRET);
    const result = decryptConfig({ A: enc, B: "plain" }, SECRET);
    expect(result.A).toBe("secret");
    expect(result.B).toBe("plain");
  });
});

describe("encryptBothConfigs", () => {
  it("encrypts staging and production", () => {
    const { staging, production } = encryptBothConfigs(
      { KEY: "s" },
      { KEY: "p" },
      SECRET
    );
    expect(isEncrypted(staging.KEY)).toBe(true);
    expect(isEncrypted(production.KEY)).toBe(true);
  });
});
