import { reportCastEntry, reportCastResult, reportCastSummary, reportCastError } from './cast-reporter';
import { CastResult, CastConfigResult } from '../config/cast';

const spy = () => jest.spyOn(console, 'log').mockImplementation(() => {});
const spyErr = () => jest.spyOn(console, 'error').mockImplementation(() => {});

afterEach(() => jest.restoreAllMocks());

describe('reportCastEntry', () => {
  it('prints ok entry with original and casted value', () => {
    const s = spy();
    const entry: CastResult = { key: 'PORT', original: '3000', casted: 3000, type: 'number' };
    reportCastEntry(entry);
    expect(s).toHaveBeenCalledTimes(1);
    expect(s.mock.calls[0][0]).toContain('PORT');
    expect(s.mock.calls[0][0]).toContain('3000');
  });

  it('prints error entry with error message', () => {
    const s = spy();
    const entry: CastResult = { key: 'X', original: 'bad', casted: 'bad', type: 'number', error: 'Cannot cast' };
    reportCastEntry(entry);
    expect(s.mock.calls[0][0]).toContain('error');
    expect(s.mock.calls[0][0]).toContain('Cannot cast');
  });

  it('shows unchanged value without arrow when value did not change', () => {
    const s = spy();
    const entry: CastResult = { key: 'NAME', original: 'app', casted: 'app', type: 'string' };
    reportCastEntry(entry);
    expect(s.mock.calls[0][0]).toContain('app');
  });
});

describe('reportCastResult', () => {
  it('prints label and all entries', () => {
    const s = spy();
    const result: CastConfigResult = {
      values: { PORT: 3000 },
      entries: [{ key: 'PORT', original: '3000', casted: 3000, type: 'number' }],
      errors: [],
    };
    reportCastResult('staging', result);
    expect(s).toHaveBeenCalledWith(expect.stringContaining('staging'));
  });

  it('prints (no entries) when empty', () => {
    const s = spy();
    reportCastResult('empty', { values: {}, entries: [], errors: [] });
    expect(s).toHaveBeenCalledWith(expect.stringContaining('no entries'));
  });
});

describe('reportCastSummary', () => {
  it('shows ok count and no error text when clean', () => {
    const s = spy();
    const result: CastConfigResult = {
      values: {},
      entries: [{ key: 'A', original: '1', casted: 1, type: 'auto' }],
      errors: [],
    };
    reportCastSummary(result);
    const out = s.mock.calls[0][0];
    expect(out).toContain('1 ok');
    expect(out).not.toContain('error');
  });

  it('shows error count when errors exist', () => {
    const s = spy();
    const err: CastResult = { key: 'X', original: 'bad', casted: 'bad', type: 'number', error: 'fail' };
    reportCastSummary({ values: {}, entries: [err], errors: [err] });
    expect(s.mock.calls[0][0]).toContain('1 error');
  });
});

describe('reportCastError', () => {
  it('prints to stderr', () => {
    const s = spyErr();
    reportCastError('something went wrong');
    expect(s).toHaveBeenCalledWith(expect.stringContaining('something went wrong'));
  });
});
