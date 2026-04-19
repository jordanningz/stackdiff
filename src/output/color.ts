export const RESET = '\x1b[0m';
export const RED = '\x1b[31m';
export const GREEN = '\x1b[32m';
export const YELLOW = '\x1b[33m';
export const DIM = '\x1b[2m';

export function colorize(text: string, color: string): string {
  return `${color}${text}${RESET}`;
}

export function red(text: string): string { return colorize(text, RED); }
export function green(text: string): string { return colorize(text, GREEN); }
export function yellow(text: string): string { return colorize(text, YELLOW); }
export function dim(text: string): string { return colorize(text, DIM); }

import type { DiffEntry } from './formatter';

export function colorizeEntry(line: string, entry: DiffEntry): string {
  switch (entry.status) {
    case 'added': return green(line);
    case 'removed': return red(line);
    case 'changed': return yellow(line);
    case 'unchanged': return dim(line);
  }
}

export function applyColors(tableOutput: string, entries: DiffEntry[]): string {
  const lines = tableOutput.split('\n');
  const header = lines.slice(0, 2);
  const dataLines = lines.slice(2);

  const coloredData = dataLines.map((line, i) => {
    const entry = entries[i];
    if (!entry) return line;
    return colorizeEntry(line, entry);
  });

  return [...header, ...coloredData].join('\n');
}
