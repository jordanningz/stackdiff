import { compareConfigs, compareSummary } from './compare';
import * as loader from './loader';
import * as diff from './diff';
import * as mask from './mask';
import * as interpolate from './interpolate';

jest.mock('./loader');
jest.mock('./diff');
jest.mock('./mask');
jest.mock('./interpolate');

const mockStaging = { API_URL: 'http://staging.api', SECRET: 'abc' };
const mockProduction = { API_URL: 'http://prod.api', SECRET: 'xyz' };
const mockDiff = [
  { key: 'API_URL', status: 'changed', staging: 'http://staging.api', production: 'http://prod.api' },
  { key: 'SECRET', status: 'changed', staging: 'abc', production: 'xyz' },
];

beforeEach(() => {
  jest.clearAllMocks();
  (loader.loadConfigs as jest.Mock).mockResolvedValue({ staging: mockStaging, production: mockProduction });
  (diff.diffConfigs as jest.Mock).mockReturnValue(mockDiff);
  (diff.filterDiff as jest.Mock).mockImplementation((d) => d);
  (mask.maskConfig as jest.Mock).mockImplementation((cfg) => ({ masked: cfg, keys: [] }));
  (interpolate.interpolateConfig as jest.Mock).mockImplementation((cfg) => cfg);
});

describe('compareConfigs', () => {
  it('loads and diffs configs', async () => {
    const result = await compareConfigs({ stagingPath: '.env.staging', productionPath: '.env.production' });
    expect(loader.loadConfigs).toHaveBeenCalledWith('.env.staging', '.env.production');
    expect(diff.diffConfigs).toHaveBeenCalled();
    expect(result.diff).toEqual(mockDiff);
  });

  it('applies masking when maskSensitive is true', async () => {
    (mask.maskConfig as jest.Mock).mockReturnValue({ masked: { API_URL: 'http://staging.api', SECRET: '***' }, keys: ['SECRET'] });
    const result = await compareConfigs({ stagingPath: 'a', productionPath: 'b', maskSensitive: true });
    expect(mask.maskConfig).toHaveBeenCalledTimes(2);
    expect(result.maskedKeys).toContain('SECRET');
  });

  it('applies interpolation when interpolate is true', async () => {
    await compareConfigs({ stagingPath: 'a', productionPath: 'b', interpolate: true });
    expect(interpolate.interpolateConfig).toHaveBeenCalledTimes(2);
  });

  it('filters by keys when provided', async () => {
    const result = await compareConfigs({ stagingPath: 'a', productionPath: 'b', keys: ['API_URL'] });
    expect(result.diff.every((d) => d.key === 'API_URL')).toBe(true);
  });

  it('filters only changed when onlyChanged is true', async () => {
    await compareConfigs({ stagingPath: 'a', productionPath: 'b', onlyChanged: true });
    expect(diff.filterDiff).toHaveBeenCalledWith(mockDiff, 'changed');
  });
});

describe('compareSummary', () => {
  it('returns correct summary string', () => {
    const result = {
      staging: mockStaging,
      production: mockProduction,
      diff: mockDiff as any,
      maskedKeys: [],
      options: { stagingPath: 'a', productionPath: 'b' },
    };
    const summary = compareSummary(result);
    expect(summary).toContain('Total: 2');
    expect(summary).toContain('Changed: 2');
    expect(summary).toContain('Added: 0');
    expect(summary).toContain('Removed: 0');
  });
});
