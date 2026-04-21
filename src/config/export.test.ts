import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { exportConfig, exportBothConfigs } from './export';

const sampleConfig: Record<string, string> = {
  APP_NAME: 'stackdiff',
  PORT: '3000',
  DEBUG: 'false',
};

let tmpDir: string;

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'stackdiff-export-'));
});

afterEach(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

describe('exportConfig', () => {
  it('exports config as json', () => {
    const result = exportConfig(sampleConfig, {
      format: 'json',
      outputPath: path.join(tmpDir, 'out.json'),
    });
    expect(result.keyCount).toBe(3);
    expect(result.format).toBe('json');
    const raw = fs.readFileSync(result.outputPath, 'utf8');
    const parsed = JSON.parse(raw);
    expect(parsed.APP_NAME).toBe('stackdiff');
  });

  it('exports config as dotenv', () => {
    const result = exportConfig(sampleConfig, {
      format: 'dotenv',
      outputPath: path.join(tmpDir, 'out.env'),
    });
    expect(result.bytesWritten).toBeGreaterThan(0);
    const raw = fs.readFileSync(result.outputPath, 'utf8');
    expect(raw).toContain('APP_NAME=stackdiff');
  });

  it('creates nested directories if needed', () => {
    const nested = path.join(tmpDir, 'a', 'b', 'c', 'out.json');
    const result = exportConfig(sampleConfig, { format: 'json', outputPath: nested });
    expect(fs.existsSync(result.outputPath)).toBe(true);
  });
});

describe('exportBothConfigs', () => {
  it('exports staging and production separately', () => {
    const prod = { ...sampleConfig, PORT: '8080' };
    const results = exportBothConfigs(sampleConfig, prod, {
      format: 'dotenv',
      outputDir: tmpDir,
    });
    expect(fs.existsSync(results.staging.outputPath)).toBe(true);
    expect(fs.existsSync(results.production.outputPath)).toBe(true);
    expect(results.staging.outputPath).toContain('staging.env');
    expect(results.production.outputPath).toContain('production.env');
  });
});
