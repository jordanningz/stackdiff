import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';
import { resolvePath, resolveMany, assertResolved } from './resolve';

describe('resolvePath', () => {
  let tmpDir: string;
  let testFile: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'stackdiff-'));
    testFile = path.join(tmpDir, '.env');
    fs.writeFileSync(testFile, 'KEY=value');
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true });
  });

  it('resolves an absolute path', () => {
    const result = resolvePath(testFile);
    expect(result.absolute).toBe(testFile);
    expect(result.exists).toBe(true);
    expect(result.extension).toBe('.env');
  });

  it('resolves a relative path using basePath', () => {
    const result = resolvePath('.env', { basePath: tmpDir });
    expect(result.absolute).toBe(testFile);
    expect(result.exists).toBe(true);
  });

  it('returns exists=false for missing file with allowMissing', () => {
    const result = resolvePath('nonexistent.env', {
      basePath: tmpDir,
      allowMissing: true,
    });
    expect(result.exists).toBe(false);
  });

  it('tries extensions when file not found', () => {
    const result = resolvePath('.env', { basePath: tmpDir });
    expect(result.exists).toBe(true);
    expect(result.extension).toBe('.env');
  });

  it('includes relative path in result', () => {
    const result = resolvePath(testFile, { basePath: tmpDir });
    expect(result.relative).toBe('.env');
  });
});

describe('resolveMany', () => {
  it('resolves multiple paths', () => {
    const results = resolveMany(['a.env', 'b.env'], {
      basePath: '/tmp',
      allowMissing: true,
    });
    expect(results).toHaveLength(2);
    expect(results[0].exists).toBe(false);
  });
});

describe('assertResolved', () => {
  it('throws when file does not exist', () => {
    expect(() =>
      assertResolved({ absolute: '/no/such/file', relative: 'file', exists: false, extension: '' })
    ).toThrow('Config file not found');
  });

  it('does not throw when file exists', () => {
    expect(() =>
      assertResolved({ absolute: '/some/file', relative: 'file', exists: true, extension: '.env' })
    ).not.toThrow();
  });
});
