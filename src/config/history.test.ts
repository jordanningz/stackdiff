import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import {
  recordHistory,
  loadHistory,
  latestHistoryEntry,
  pruneHistory,
  clearHistory,
} from './history';

const tmpDir = path.join(os.tmpdir(), 'stackdiff-history-test-' + process.pid);

beforeEach(() => {
  fs.mkdirSync(tmpDir, { recursive: true });
  process.env.STACKDIFF_HISTORY_DIR = tmpDir;
});

afterEach(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
  delete process.env.STACKDIFF_HISTORY_DIR;
});

const sampleConfig = { DB_HOST: 'localhost', PORT: '5432', DEBUG: 'false' };

describe('recordHistory', () => {
  it('creates a history entry file', () => {
    recordHistory('staging', sampleConfig);
    const files = fs.readdirSync(tmpDir);
    expect(files.length).toBe(1);
    expect(files[0]).toMatch(/\.json$/);
  });

  it('stores the correct env and config', () => {
    recordHistory('production', sampleConfig);
    const files = fs.readdirSync(tmpDir);
    const entry = JSON.parse(fs.readFileSync(path.join(tmpDir, files[0]), 'utf8'));
    expect(entry.env).toBe('production');
    expect(entry.config).toEqual(sampleConfig);
    expect(entry.timestamp).toBeDefined();
    expect(entry.id).toBeDefined();
  });
});

describe('loadHistory', () => {
  it('returns empty array when no history exists', () => {
    const result = loadHistory('staging');
    expect(result).toEqual([]);
  });

  it('returns entries for matching env sorted by timestamp desc', () => {
    recordHistory('staging', { A: '1' });
    recordHistory('staging', { A: '2' });
    recordHistory('production', { A: '3' });
    const result = loadHistory('staging');
    expect(result).toHaveLength(2);
    expect(result.every((e) => e.env === 'staging')).toBe(true);
    expect(result[0].timestamp >= result[1].timestamp).toBe(true);
  });

  it('returns all entries when env is omitted', () => {
    recordHistory('staging', { A: '1' });
    recordHistory('production', { B: '2' });
    const result = loadHistory();
    expect(result).toHaveLength(2);
  });
});

describe('latestHistoryEntry', () => {
  it('returns undefined when no history exists', () => {
    expect(latestHistoryEntry('staging')).toBeUndefined();
  });

  it('returns the most recent entry for the given env', () => {
    recordHistory('staging', { A: '1' });
    recordHistory('staging', { A: '2' });
    const latest = latestHistoryEntry('staging');
    expect(latest).toBeDefined();
    expect(latest!.config).toEqual({ A: '2' });
  });
});

describe('pruneHistory', () => {
  it('keeps only the N most recent entries per env', () => {
    for (let i = 0; i < 5; i++) {
      recordHistory('staging', { INDEX: String(i) });
    }
    pruneHistory('staging', 3);
    const result = loadHistory('staging');
    expect(result).toHaveLength(3);
  });

  it('does not affect entries for other envs', () => {
    for (let i = 0; i < 4; i++) {
      recordHistory('staging', { I: String(i) });
    }
    recordHistory('production', { X: '1' });
    pruneHistory('staging', 2);
    expect(loadHistory('staging')).toHaveLength(2);
    expect(loadHistory('production')).toHaveLength(1);
  });
});

describe('clearHistory', () => {
  it('removes all history entries for the given env', () => {
    recordHistory('staging', { A: '1' });
    recordHistory('staging', { A: '2' });
    recordHistory('production', { B: '1' });
    clearHistory('staging');
    expect(loadHistory('staging')).toHaveLength(0);
    expect(loadHistory('production')).toHaveLength(1);
  });
});
