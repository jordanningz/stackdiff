import { parseArgs } from './args';

describe('parseArgs', () => {
  const base = ['node', 'stackdiff'];

  it('parses required staging and production flags', () => {
    const opts = parseArgs([...base, '-s', '.env.staging', '-p', '.env.production']);
    expect(opts.staging).toBe('.env.staging');
    expect(opts.production).toBe('.env.production');
  });

  it('defaults format to table', () => {
    const opts = parseArgs([...base, '-s', 'a', '-p', 'b']);
    expect(opts.format).toBe('table');
  });

  it('parses format option', () => {
    const opts = parseArgs([...base, '-s', 'a', '-p', 'b', '-f', 'json']);
    expect(opts.format).toBe('json');
  });

  it('defaults filter to all', () => {
    const opts = parseArgs([...base, '-s', 'a', '-p', 'b']);
    expect(opts.filter).toBe('all');
  });

  it('parses filter option', () => {
    const opts = parseArgs([...base, '-s', 'a', '-p', 'b', '--filter', 'changed']);
    expect(opts.filter).toBe('changed');
  });

  it('enables color by default', () => {
    const opts = parseArgs([...base, '-s', 'a', '-p', 'b']);
    expect(opts.color).toBe(true);
  });

  it('disables color with --no-color', () => {
    const opts = parseArgs([...base, '-s', 'a', '-p', 'b', '--no-color']);
    expect(opts.color).toBe(false);
  });

  it('defaults summary to false', () => {
    const opts = parseArgs([...base, '-s', 'a', '-p', 'b']);
    expect(opts.summary).toBe(false);
  });

  it('enables summary flag', () => {
    const opts = parseArgs([...base, '-s', 'a', '-p', 'b', '--summary']);
    expect(opts.summary).toBe(true);
  });
});
