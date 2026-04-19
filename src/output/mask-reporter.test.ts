import { reportMaskedKeys, reportMaskSummary } from "./mask-reporter";

const stagingConfig = {
  APP_NAME: "myapp",
  API_KEY: "key-staging",
  PORT: "3000",
};

const productionConfig = {
  APP_NAME: "myapp-prod",
  API_KEY: "key-prod",
  DB_PASSWORD: "prodpass",
};

describe("reportMaskedKeys", () => {
  let spy: jest.SpyInstance;

  beforeEach(() => {
    spy = jest.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => spy.mockRestore());

  it("reports masked keys for a config", () => {
    reportMaskedKeys("staging", stagingConfig);
    const output = spy.mock.calls.map((c) => c[0]).join("\n");
    expect(output).toMatch(/API_KEY/);
    expect(output).toMatch(/1 sensitive/);
  });

  it("reports no sensitive keys when none found", () => {
    reportMaskedKeys("staging", { APP_NAME: "myapp", PORT: "3000" });
    const output = spy.mock.calls.map((c) => c[0]).join("\n");
    expect(output).toMatch(/No sensitive/);
  });
});

describe("reportMaskSummary", () => {
  let spy: jest.SpyInstance;

  beforeEach(() => {
    spy = jest.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => spy.mockRestore());

  it("reports combined sensitive keys from both envs", () => {
    reportMaskSummary(stagingConfig, productionConfig);
    const output = spy.mock.calls.map((c) => c[0]).join("\n");
    expect(output).toMatch(/API_KEY/);
    expect(output).toMatch(/DB_PASSWORD/);
  });

  it("reports nothing when both configs have no sensitive keys", () => {
    reportMaskSummary({ PORT: "3000" }, { PORT: "8080" });
    const output = spy.mock.calls.map((c) => c[0]).join("\n");
    expect(output).toMatch(/No sensitive/);
  });
});
