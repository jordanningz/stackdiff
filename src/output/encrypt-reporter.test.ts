import { reportEncryptResult, reportDecryptResult, reportEncryptSummary, reportEncryptError } from "./encrypt-reporter";
import { encryptValue } from "../config/encrypt";

const SECRET = "test";

beforeEach(() => {
  jest.spyOn(console, "log").mockImplementation(() => {});
  jest.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe("reportEncryptResult", () => {
  it("logs encrypted keys", () => {
    const original = { A: "plain" };
    const result = { A: encryptValue("plain", SECRET) };
    reportEncryptResult(original, result, "staging");
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining("encrypted: A"));
  });

  it("logs skipped keys when already encrypted", () => {
    const enc = encryptValue("v", SECRET);
    reportEncryptResult({ A: enc }, { A: enc }, "staging");
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining("skipped"));
  });

  it("logs nothing when no keys", () => {
    reportEncryptResult({}, {}, "staging");
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining("No keys"));
  });
});

describe("reportDecryptResult", () => {
  it("logs decrypted keys", () => {
    reportDecryptResult({ A: "plain" }, "production");
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining("decrypted: A"));
  });

  it("logs nothing when result still encrypted", () => {
    const enc = encryptValue("v", SECRET);
    reportDecryptResult({ A: enc }, "production");
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining("Nothing decrypted"));
  });
});

describe("reportEncryptSummary", () => {
  it("prints summary counts", () => {
    const enc = encryptValue("v", SECRET);
    reportEncryptSummary({ A: "plain", B: enc }, { A: enc, B: enc });
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining("1 newly encrypted"));
  });
});

describe("reportEncryptError", () => {
  it("prints error message", () => {
    reportEncryptError("MY_KEY", new Error("bad key"));
    expect(console.error).toHaveBeenCalledWith(expect.stringContaining("MY_KEY"));
    expect(console.error).toHaveBeenCalledWith(expect.stringContaining("bad key"));
  });
});
