import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { saveSnapshot, loadSnapshot, listSnapshots, latestSnapshot } from './snapshot';
import { EnvConfig } from './loader';

const config: EnvConfig = { APP_ENV: 'staging', PORT: '3000' };

let tmpDir: string;

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'stackdiff-'));
});

afterEach(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

test('saveSnapshot writes a valid file', () => {
  const filepath = saveSnapshot('staging', config, tmpDir);
  expect(fs.existsSync(filepath)).toBe(true);
  const raw = JSON.parse(fs.readFileSync(filepath, 'utf-8'));
  expect(raw.label).toBe('staging');
  expect(raw.config).toEqual(config);
  expect(raw.timestamp).toBeDefined();
});

test('loadSnapshot reads back correctly', () => {
  const filepath = saveSnapshot('staging', config, tmpDir);
  const snap = loadSnapshot(filepath);
  expect(snap.label).toBe('staging');
  expect(snap.config).toEqual(config);
});

test('loadSnapshot throws on invalid file', () => {
  const bad = path.join(tmpDir, 'bad.json');
  fs.writeFileSync(bad, JSON.stringify({ foo: 'bar' }));
  expect(() => loadSnapshot(bad)).toThrow('Invalid snapshot file');
});

test('listSnapshots returns files filtered by label', () => {
  saveSnapshot('staging', config, tmpDir);
  saveSnapshot('production', config, tmpDir);
  const stagingFiles = listSnapshots(tmpDir, 'staging');
  expect(stagingFiles.length).toBe(1);
  expect(stagingFiles[0]).toContain('staging');
});

test('latestSnapshot returns null when no snapshots exist', () => {
  const result = latestSnapshot(tmpDir, 'staging');
  expect(result).toBeNull();
});

test('latestSnapshot returns the most recent snapshot', () => {
  saveSnapshot('staging', { ...config, PORT: '3001' }, tmpDir);
  saveSnapshot('staging', { ...config, PORT: '3002' }, tmpDir);
  const snap = latestSnapshot(tmpDir, 'staging');
  expect(snap).not.toBeNull();
  expect(snap!.label).toBe('staging');
});
