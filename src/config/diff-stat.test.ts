import { computeDiffStat, compareDiffStats } from './diff-stat';
import { DiffResult } from './diff';

const makeDiff = (entries: Record<string, { status: string; staging?: string; production?: string }>): DiffResult =>
  entries as unknown as DiffResult;

describe('computeDiffStat', () => {
  it('counts added, removed, changed, unchanged keys', () => {
    const diff = makeDiff({
      A: { status: 'added', production: 'x' },
      B: { status: 'removed', staging: 'y' },
      C: { status: 'changed', staging: '1', production: '2' },
      D: { status: 'unchanged', staging: 'z', production: 'z' },
    });
    const stat = computeDiffStat(diff);
    expect(stat.added).toBe(1);
    expect(stat.removed).toBe(1);
    expect(stat.changed).toBe(1);
    expect(stat.unchanged).toBe(1);
    expect(stat.total).toBe(4);
  });

  it('computes changeRate correctly', () => {
    const diff = makeDiff({
      A: { status: 'added' },
      B: { status: 'unchanged' },
      C: { status: 'unchanged' },
      D: { status: 'unchanged' },
    });
    const stat = computeDiffStat(diff);
    expect(stat.changeRate).toBeCloseTo(0.25);
  });

  it('returns zero changeRate for empty diff', () => {
    const stat = computeDiffStat(makeDiff({}));
    expect(stat.changeRate).toBe(0);
    expect(stat.total).toBe(0);
  });

  it('tracks addedKeys, removedKeys, changedKeys', () => {
    const diff = makeDiff({
      FOO: { status: 'added' },
      BAR: { status: 'removed' },
      BAZ: { status: 'changed' },
    });
    const stat = computeDiffStat(diff);
    expect(stat.addedKeys).toContain('FOO');
    expect(stat.removedKeys).toContain('BAR');
    expect(stat.changedKeys).toContain('BAZ');
  });
});

describe('compareDiffStats', () => {
  it('identifies which stat has more changes', () => {
    const a = { added: 3, removed: 1, changed: 1, unchanged: 5, total: 10, changeRate: 0.5 };
    const b = { added: 1, removed: 0, changed: 0, unchanged: 9, total: 10, changeRate: 0.1 };
    const result = compareDiffStats(a, b);
    expect(result.moreChanged).toBe('a');
  });

  it('returns equal when changeRates are the same', () => {
    const a = { added: 1, removed: 0, changed: 0, unchanged: 1, total: 2, changeRate: 0.5 };
    const b = { added: 0, removed: 1, changed: 0, unchanged: 1, total: 2, changeRate: 0.5 };
    const result = compareDiffStats(a, b);
    expect(result.moreChanged).toBe('equal');
  });
});
