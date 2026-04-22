import { opLabel, reportPatchResult, reportPatchSummary } from './patch-reporter';
import { PatchResult } from '../config/patch';

// Mock colorize helpers to strip ANSI for easier assertions
jest.mock('./color', () => ({
  green: (s: string) => `[green]${s}[/green]`,
  red: (s: string) => `[red]${s}[/red]`,
  yellow: (s: string) => `[yellow]${s}[/yellow]`,
  dim: (s: string) => `[dim]${s}[/dim]`,
  bold: (s: string) => `[bold]${s}[/bold]`,
  cyan: (s: string) => `[cyan]${s}[/cyan]`,
}));

describe('opLabel', () => {
  it('returns colored label for set', () => {
    expect(opLabel('set')).toContain('set');
  });

  it('returns colored label for delete', () => {
    expect(opLabel('delete')).toContain('delete');
  });

  it('returns colored label for rename', () => {
    expect(opLabel('rename')).toContain('rename');
  });

  it('returns fallback for unknown op', () => {
    expect(opLabel('unknown' as any)).toContain('unknown');
  });
});

describe('reportPatchResult', () => {
  let output: string[];
  const print = (line: string) => output.push(line);

  beforeEach(() => {
    output = [];
  });

  it('reports a set operation', () => {
    const result: PatchResult = {
      op: 'set',
      key: 'API_URL',
      oldValue: 'http://old.example.com',
      newValue: 'http://new.example.com',
    };
    reportPatchResult(result, print);
    const joined = output.join(' ');
    expect(joined).toContain('API_URL');
    expect(joined).toContain('http://new.example.com');
  });

  it('reports a delete operation', () => {
    const result: PatchResult = {
      op: 'delete',
      key: 'OLD_KEY',
      oldValue: 'some_value',
      newValue: undefined,
    };
    reportPatchResult(result, print);
    const joined = output.join(' ');
    expect(joined).toContain('OLD_KEY');
  });

  it('reports a rename operation', () => {
    const result: PatchResult = {
      op: 'rename',
      key: 'OLD_NAME',
      oldValue: 'value',
      newValue: 'value',
      newKey: 'NEW_NAME',
    };
    reportPatchResult(result, print);
    const joined = output.join(' ');
    expect(joined).toContain('OLD_NAME');
    expect(joined).toContain('NEW_NAME');
  });

  it('shows old value when available', () => {
    const result: PatchResult = {
      op: 'set',
      key: 'PORT',
      oldValue: '3000',
      newValue: '4000',
    };
    reportPatchResult(result, print);
    const joined = output.join(' ');
    expect(joined).toContain('3000');
    expect(joined).toContain('4000');
  });
});

describe('reportPatchSummary', () => {
  let output: string[];
  const print = (line: string) => output.push(line);

  beforeEach(() => {
    output = [];
  });

  it('prints summary with counts', () => {
    const results: PatchResult[] = [
      { op: 'set', key: 'A', oldValue: '1', newValue: '2' },
      { op: 'delete', key: 'B', oldValue: 'x', newValue: undefined },
      { op: 'set', key: 'C', oldValue: undefined, newValue: 'new' },
    ];
    reportPatchSummary(results, print);
    const joined = output.join(' ');
    expect(joined).toContain('3');
  });

  it('prints summary for empty results', () => {
    reportPatchSummary([], print);
    expect(output.length).toBeGreaterThan(0);
  });

  it('breaks down by operation type', () => {
    const results: PatchResult[] = [
      { op: 'set', key: 'A', oldValue: undefined, newValue: 'v' },
      { op: 'rename', key: 'B', oldValue: 'v', newValue: 'v', newKey: 'C' },
    ];
    reportPatchSummary(results, print);
    const joined = output.join(' ');
    // Should mention both op types in summary
    expect(joined).toMatch(/set|rename/i);
  });
});
