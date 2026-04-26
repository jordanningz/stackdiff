import * as fs from "fs";
import * as path from "path";
import { EnvConfig } from "./loader";

/**
 * History entry representing a recorded config state at a point in time.
 */
export interface HistoryEntry {
  id: string;
  timestamp: number;
  label?: string;
  config: EnvConfig;
}

/**
 * Diff between two history entries.
 */
export interface HistoryDiff {
  fromId: string;
  toId: string;
  added: Record<string, string>;
  removed: Record<string, string>;
  changed: Record<string, { from: string; to: string }>;
}

const DEFAULT_HISTORY_DIR = ".stackdiff/history";

/** Returns the history directory, defaulting to .stackdiff/history */
function historyDir(): string {
  return process.env.STACKDIFF_HISTORY_DIR ?? DEFAULT_HISTORY_DIR;
}

/** Generates a unique entry ID based on timestamp + random suffix. */
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

/** Ensures the history directory exists. */
function ensureDir(dir: string): void {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

/**
 * Records a new history entry for the given config.
 * Returns the saved entry.
 */
export function recordHistory(
  name: string,
  config: EnvConfig,
  label?: string
): HistoryEntry {
  const dir = path.join(historyDir(), name);
  ensureDir(dir);

  const entry: HistoryEntry = {
    id: generateId(),
    timestamp: Date.now(),
    label,
    config,
  };

  const file = path.join(dir, `${entry.id}.json`);
  fs.writeFileSync(file, JSON.stringify(entry, null, 2), "utf8");
  return entry;
}

/**
 * Loads all history entries for a named config, sorted oldest-first.
 */
export function loadHistory(name: string): HistoryEntry[] {
  const dir = path.join(historyDir(), name);
  if (!fs.existsSync(dir)) return [];

  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".json"))
    .map((f) => {
      const raw = fs.readFileSync(path.join(dir, f), "utf8");
      return JSON.parse(raw) as HistoryEntry;
    })
    .sort((a, b) => a.timestamp - b.timestamp);
}

/**
 * Returns the most recent history entry for a named config, or undefined.
 */
export function latestHistory(name: string): HistoryEntry | undefined {
  const entries = loadHistory(name);
  return entries[entries.length - 1];
}

/**
 * Computes a diff between two history entries.
 */
export function diffHistory(from: HistoryEntry, to: HistoryEntry): HistoryDiff {
  const added: Record<string, string> = {};
  const removed: Record<string, string> = {};
  const changed: Record<string, { from: string; to: string }> = {};

  const allKeys = new Set([
    ...Object.keys(from.config),
    ...Object.keys(to.config),
  ]);

  for (const key of allKeys) {
    const inFrom = key in from.config;
    const inTo = key in to.config;

    if (inFrom && !inTo) {
      removed[key] = from.config[key];
    } else if (!inFrom && inTo) {
      added[key] = to.config[key];
    } else if (from.config[key] !== to.config[key]) {
      changed[key] = { from: from.config[key], to: to.config[key] };
    }
  }

  return { fromId: from.id, toId: to.id, added, removed, changed };
}

/**
 * Purges history entries older than `maxAgeDays` days for a named config.
 * Returns the number of entries removed.
 */
export function pruneHistory(name: string, maxAgeDays: number): number {
  const dir = path.join(historyDir(), name);
  if (!fs.existsSync(dir)) return 0;

  const cutoff = Date.now() - maxAgeDays * 24 * 60 * 60 * 1000;
  const entries = loadHistory(name);
  let removed = 0;

  for (const entry of entries) {
    if (entry.timestamp < cutoff) {
      const file = path.join(dir, `${entry.id}.json`);
      if (fs.existsSync(file)) {
        fs.unlinkSync(file);
        removed++;
      }
    }
  }

  return removed;
}
