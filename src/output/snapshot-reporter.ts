import { Snapshot } from '../config/snapshot';
import { diffConfigs, DiffEntry } from '../config/diff';
import { colorize, green, red, yellow, dim } from './color';

export function reportSnapshotInfo(snap: Snapshot): void {
  console.log(colorize(`Snapshot: ${snap.label}`, dim));
  console.log(colorize(`Timestamp: ${snap.timestamp}`, dim));
  console.log(colorize(`Keys: ${Object.keys(snap.config).length}`, dim));
}

export function reportSnapshotDiff(older: Snapshot, newer: Snapshot): void {
  const diff = diffConfigs(older.config, newer.config);
  if (diff.length === 0) {
    console.log(colorize('No changes between snapshots.', green));
    return;
  }

  console.log(
    colorize(`Diff: ${older.label}@${older.timestamp} → ${newer.label}@${newer.timestamp}`, dim)
  );

  for (const entry of diff) {
    if (entry.status === 'added') {
      console.log(colorize(`+ ${entry.key}=${entry.next}`, green));
    } else if (entry.status === 'removed') {
      console.log(colorize(`- ${entry.key}=${entry.prev}`, red));
    } else if (entry.status === 'changed') {
      console.log(colorize(`~ ${entry.key}: ${entry.prev} → ${entry.next}`, yellow));
    }
  }

  const added = diff.filter(d => d.status === 'added').length;
  const removed = diff.filter(d => d.status === 'removed').length;
  const changed = diff.filter(d => d.status === 'changed').length;

  console.log(
    colorize(`Summary: +${added} -${removed} ~${changed}`, dim)
  );
}
