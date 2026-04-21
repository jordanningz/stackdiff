import { reportWatchStart, reportWatchChange, reportWatchError, reportWatchStop } from './watch-reporter';

const mockDiff = (added = {}, removed = {}, changed = {}) => ({
  added,
  removed,
  changed,
  unchanged: {},
});

beforeEach(() => jest.spyOn(console, 'log').mockImplementation(() => {}));
afterEach(() => jest.restoreAllMocks());

test('reportWatchStart prints paths and interval', () => {
  reportWatchStart('.env.staging', '.env.production', 2000);
  const output = (console.log as jest.Mock).mock.calls.flat().join('\n');
  expect(output).toContain('.env.staging');
  expect(output).toContain('.env.production');
  expect(output).toContain('2000ms');
});

test('reportWatchChange shows added count', () => {
  reportWatchChange(mockDiff({ NEW_KEY: 'val' }) as any);
  const output = (console.log as jest.Mock).mock.calls.flat().join('\n');
  expect(output).toMatch(/1 added/);
});

test('reportWatchChange shows removed count', () => {
  reportWatchChange(mockDiff({}, { OLD_KEY: 'val' }) as any);
  const output = (console.log as jest.Mock).mock.calls.flat().join('\n');
  expect(output).toMatch(/1 removed/);
});

test('reportWatchChange shows changed count', () => {
  reportWatchChange(mockDiff({}, {}, { KEY: { staging: 'a', production: 'b' } }) as any);
  const output = (console.log as jest.Mock).mock.calls.flat().join('\n');
  expect(output).toMatch(/1 changed/);
});

test('reportWatchChange shows no differences message when empty', () => {
  reportWatchChange(mockDiff() as any);
  const output = (console.log as jest.Mock).mock.calls.flat().join('\n');
  expect(output).toContain('no key-level differences');
});

test('reportWatchError prints error message', () => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
  reportWatchError(new Error('disk read failed'));
  const output = (console.error as jest.Mock).mock.calls.flat().join('\n');
  expect(output).toContain('disk read failed');
});

test('reportWatchStop prints stopped message', () => {
  reportWatchStop();
  const output = (console.log as jest.Mock).mock.calls.flat().join('\n');
  expect(output).toContain('Watch stopped');
});
