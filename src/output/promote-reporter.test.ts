import { reportPromoteResult, reportPromoteSummary, reportPromoteError } from "./promote-reporter";
import { PromoteResult } from "../config/promote";

const spy = jest.spyOn(console, "log").mockImplementation(() => {});
const errSpy = jest.spyOn(console, "error").mockImplementation(() => {});

afterEach(() => { spy.mockClear(); errSpy.mockClear(); });
afterAll(() => { spy.mockRestore(); errSpy.mockRestore(); });

const baseResult: PromoteResult = {
  promoted: { API_URL: { from: "https://api.prod.com", to: "https://api.staging.com" } },
  skipped: { DB_PASS: "key already exists in target (use --overwrite to replace)" },
  dryRun: false,
};

describe("reportPromoteResult", () => {
  it("prints promoted and skipped keys", () => {
    reportPromoteResult(baseResult);
    const output = spy.mock.calls.flat().join(" ");
    expect(output).toMatch(/API_URL/);
    expect(output).toMatch(/DB_PASS/);
  });

  it("shows dry-run notice when dryRun is true", () => {
    reportPromoteResult({ ...baseResult, dryRun: true });
    const output = spy.mock.calls.flat().join(" ");
    expect(output).toMatch(/dry-run/);
  });

  it("shows nothing to promote when empty", () => {
    reportPromoteResult({ promoted: {}, skipped: {}, dryRun: false });
    const output = spy.mock.calls.flat().join(" ");
    expect(output).toMatch(/Nothing to promote/);
  });

  it("marks new keys correctly", () => {
    const r: PromoteResult = { promoted: { NEW: { from: "val", to: undefined } }, skipped: {}, dryRun: false };
    reportPromoteResult(r);
    const output = spy.mock.calls.flat().join(" ");
    expect(output).toMatch(/new key/);
  });
});

describe("reportPromoteSummary", () => {
  it("prints summary counts", () => {
    reportPromoteSummary(baseResult);
    const output = spy.mock.calls.flat().join(" ");
    expect(output).toMatch(/1 promoted/);
    expect(output).toMatch(/1 skipped/);
  });

  it("prints nothing to do when empty", () => {
    reportPromoteSummary({ promoted: {}, skipped: {}, dryRun: false });
    const output = spy.mock.calls.flat().join(" ");
    expect(output).toMatch(/nothing to do/);
  });
});

describe("reportPromoteError", () => {
  it("logs error message", () => {
    reportPromoteError("something went wrong");
    expect(errSpy).toHaveBeenCalledWith(expect.stringMatching(/something went wrong/));
  });
});
