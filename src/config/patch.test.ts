import { applyPatch, parsePatchOps, PatchOperation } from './patch';

const base = { HOST: 'localhost', PORT: '3000', DEBUG: 'true' };

describe('applyPatch', () => {
  it('applies set operation', () => {
    const ops: PatchOperation[] = [{ op: 'set', key: 'PORT', value: '8080' }];
    const { config, applied, skipped } = applyPatch(base, ops);
    expect(config.PORT).toBe('8080');
    expect(applied).toHaveLength(1);
    expect(skipped).toHaveLength(0);
  });

  it('applies delete operation on existing key', () => {
    const ops: PatchOperation[] = [{ op: 'delete', key: 'DEBUG' }];
    const { config, applied, skipped } = applyPatch(base, ops);
    expect('DEBUG' in config).toBe(false);
    expect(applied).toHaveLength(1);
    expect(skipped).toHaveLength(0);
  });

  it('skips delete on missing key', () => {
    const ops: PatchOperation[] = [{ op: 'delete', key: 'MISSING' }];
    const { skipped } = applyPatch(base, ops);
    expect(skipped).toHaveLength(1);
  });

  it('applies rename operation', () => {
    const ops: PatchOperation[] = [{ op: 'rename', from: 'HOST', to: 'HOSTNAME' }];
    const { config, applied } = applyPatch(base, ops);
    expect(config.HOSTNAME).toBe('localhost');
    expect('HOST' in config).toBe(false);
    expect(applied).toHaveLength(1);
  });

  it('skips rename on missing key', () => {
    const ops: PatchOperation[] = [{ op: 'rename', from: 'NOPE', to: 'X' }];
    const { skipped } = applyPatch(base, ops);
    expect(skipped).toHaveLength(1);
  });

  it('does not mutate original config', () => {
    const ops: PatchOperation[] = [{ op: 'set', key: 'PORT', value: '9999' }];
    applyPatch(base, ops);
    expect(base.PORT).toBe('3000');
  });
});

describe('parsePatchOps', () => {
  it('parses set operation', () => {
    const ops = parsePatchOps(['PORT=8080']);
    expect(ops[0]).toEqual({ op: 'set', key: 'PORT', value: '8080' });
  });

  it('parses delete operation', () => {
    const ops = parsePatchOps(['delete:DEBUG']);
    expect(ops[0]).toEqual({ op: 'delete', key: 'DEBUG' });
  });

  it('parses rename operation', () => {
    const ops = parsePatchOps(['HOST => HOSTNAME']);
    expect(ops[0]).toEqual({ op: 'rename', from: 'HOST', to: 'HOSTNAME' });
  });

  it('throws on invalid op', () => {
    expect(() => parsePatchOps(['BADENTRY'])).toThrow('Invalid patch op');
  });
});
