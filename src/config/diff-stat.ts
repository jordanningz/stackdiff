import { DiffResult } from './diff';

export interface DiffStat {
  added: number;
  removed: number;
  changed: number;
  unchanged: number;
  total: number;
  changeRate: number;
}

export interface KeyedDiffStat extends DiffStat {
  addedKeys: string[];
  removedKeys: string[];
  changedKeys: string[];
}

export function computeDiffStat(diff: DiffResult): KeyedDiffStat {
  const addedKeys: string[] = [];
  const removedKeys: string[] = [];
  const changedKeys: string[] = [];
  let unchanged = 0;

  for (const [key, entry] of Object.entries(diff)) {
    if (entry.status === 'added') addedKeys.push(key);
    else if (entry.status === 'removed') removedKeys.push(key);
    else if (entry.status === 'changed') changedKeys.push(key);
    else unchanged++;
  }

  const added = addedKeys.length;
  const removed = removedKeys.length;
  const changed = changedKeys.length;
  const total = added + removed + changed + unchanged;
  const changeRate = total > 0 ? (added + removed + changed) / total : 0;

  return {
    added,
    removed,
    changed,
    unchanged,
    total,
    changeRate,
    addedKeys,
    removedKeys,
    changedKeys,
  };
}

export function compareDiffStats(
  a: DiffStat,
  b: DiffStat
): { moreChanged: 'a' | 'b' | 'equal'; delta: number } {
  const delta = a.changeRate - b.changeRate;
  if (Math.abs(delta) < 1e-9) return { moreChanged: 'equal', delta: 0 };
  return { moreChanged: delta > 0 ? 'a' : 'b', delta };
}
