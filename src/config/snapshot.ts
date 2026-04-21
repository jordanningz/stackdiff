import * as fs from 'fs';
import * as path from 'path';
import { EnvConfig } from './loader';

export interface Snapshot {
  timestamp: string;
  label: string;
  config: EnvConfig;
}

export function saveSnapshot(label: string, config: EnvConfig, dir: string): string {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  const timestamp = new Date().toISOString();
  const snapshot: Snapshot = { timestamp, label, config };
  const filename = `${label}-${timestamp.replace(/[:.]/g, '-')}.json`;
  const filepath = path.join(dir, filename);
  fs.writeFileSync(filepath, JSON.stringify(snapshot, null, 2), 'utf-8');
  return filepath;
}

export function loadSnapshot(filepath: string): Snapshot {
  if (!fs.existsSync(filepath)) {
    throw new Error(`Snapshot file not found: ${filepath}`);
  }
  let raw: string;
  try {
    raw = fs.readFileSync(filepath, 'utf-8');
  } catch (err) {
    throw new Error(`Failed to read snapshot file: ${filepath}: ${(err as Error).message}`);
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error(`Snapshot file contains invalid JSON: ${filepath}`);
  }
  if (
    typeof parsed !== 'object' ||
    parsed === null ||
    !(parsed as Record<string, unknown>).timestamp ||
    !(parsed as Record<string, unknown>).label ||
    !(parsed as Record<string, unknown>).config
  ) {
    throw new Error(`Invalid snapshot file: ${filepath}`);
  }
  return parsed as Snapshot;
}

export function listSnapshots(dir: string, label?: string): string[] {
  if (!fs.existsSync(dir)) return [];
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.json'));
  if (label) {
    return files.filter(f => f.startsWith(label)).map(f => path.join(dir, f));
  }
  return files.map(f => path.join(dir, f));
}

export function latestSnapshot(dir: string, label: string): Snapshot | null {
  const files = listSnapshots(dir, label);
  if (files.length === 0) return null;
  files.sort();
  return loadSnapshot(files[files.length - 1]);
}
