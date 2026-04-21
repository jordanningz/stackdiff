import { watchConfigs, watchFiles } from './watch';
import * as loader from './loader';
import * as diff from './diff';

jest.useFakeTimers();

const mockDiff = { added: {}, removed: {}, changed: {}, unchanged: {} };

beforeEach(() => {
  jest.spyOn(loader, 'loadConfigs').mockResolvedValue({
    staging: { KEY: 'val' },
    production: { KEY: 'val' },
  } as any);
  jest.spyOn(diff, 'diffConfigs').mockReturnValue(mockDiff as any);
});

afterEach(() => jest.restoreAllMocks());

test('watchConfigs calls onChange on first poll', async () => {
  const onChange = jest.fn();
  const handle = watchConfigs({
    stagingPath: '.env.staging',
    productionPath: '.env.production',
    interval: 1000,
    onChange,
  });

  await Promise.resolve();
  expect(onChange).toHaveBeenCalledWith(mockDiff);
  handle.stop();
});

test('watchConfigs does not call onChange when diff unchanged', async () => {
  const onChange = jest.fn();
  const handle = watchConfigs({
    stagingPath: '.env.staging',
    productionPath: '.env.production',
    interval: 500,
    onChange,
  });

  await Promise.resolve();
  jest.advanceTimersByTime(600);
  await Promise.resolve();
  expect(onChange).toHaveBeenCalledTimes(1);
  handle.stop();
});

test('isRunning returns false after stop', async () => {
  const handle = watchConfigs({
    stagingPath: '.env.staging',
    productionPath: '.env.production',
    onChange: jest.fn(),
  });
  await Promise.resolve();
  expect(handle.isRunning()).toBe(true);
  handle.stop();
  expect(handle.isRunning()).toBe(false);
});

test('onError is called when loadConfigs throws', async () => {
  (loader.loadConfigs as jest.Mock).mockRejectedValueOnce(new Error('read error'));
  const onError = jest.fn();
  const handle = watchConfigs({
    stagingPath: '.env.staging',
    productionPath: '.env.production',
    onChange: jest.fn(),
    onError,
  });
  await Promise.resolve();
  expect(onError).toHaveBeenCalledWith(expect.any(Error));
  handle.stop();
});
