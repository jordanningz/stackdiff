import { reportSnapshotInfo, reportSnapshotDiff } from './snapshot-reporter';
import { Snapshot } from '../config/snapshot';

const base: Snapshot = {
  timestamp: '2024-01-01T00:00:00.000Z',
  label: 'staging',
  config: { APP_ENV: 'staging', PORT: '3000', SECRET: 'abc' },
};

const updated: Snapshot = {
  timestamp: '2024-01-02T00:00:00.000Z',
  label: 'staging',
  config: { APP_ENV: 'staging', PORT: '4000', NEW_KEY: 'xyz' },
};

let logs: string[];

beforeEach(() => {
  logs = [];
  jest.spyOn(console, 'log').mockImplementation((...args) => logs.push(args.join(' ')));
});

afterEach(() => {
  jest.restoreAllMocks();
});

test('reportSnapshotInfo logs label, timestamp, and key count', () => {
  reportSnapshotInfo(base);
  expect(logs.some(l => l.includes('staging'))).toBe(true);
  expect(logs.some(l => l.includes('2024-01-01'))).toBe(true);
  expect(logs.some(l => l.includes('3'))).toBe(true);
});

test('reportSnapshotDiff logs no changes when configs are identical', () => {
  reportSnapshotDiff(base, base);
  expect(logs.some(l => l.includes('No changes'))).toBe(true);
});

test('reportSnapshotDiff shows added, removed, and changed keys', () => {
  reportSnapshotDiff(base, updated);
  expect(logs.some(l => l.includes('NEW_KEY'))).toBe(true);
  expect(logs.some(l => l.includes('SECRET'))).toBe(true);
  expect(logs.some(l => l.includes('PORT'))).toBe(true);
});

test('reportSnapshotDiff shows summary line', () => {
  reportSnapshotDiff(base, updated);
  expect(logs.some(l => l.includes('Summary'))).toBe(true);
});
