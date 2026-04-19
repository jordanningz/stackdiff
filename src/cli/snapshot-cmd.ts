import * as path from 'path';
import { loadConfigs } from '../config/loader';
import { saveSnapshot, latestSnapshot } from '../config/snapshot';
import { reportSnapshotInfo, reportSnapshotDiff } from '../output/snapshot-reporter';

const SNAPSHOT_DIR = path.join(process.cwd(), '.stackdiff-snapshots');

export interface SnapshotArgs {
  action: 'save' | 'diff' | 'info';
  label: string;
  file?: string;
}

export async function runSnapshotCmd(args: SnapshotArgs): Promise<void> {
  if (args.action === 'save') {
    if (!args.file) throw new Error('--file is required for save action');
    const configs = loadConfigs(args.file);
    const config = configs[0];
    const filepath = saveSnapshot(args.label, config, SNAPSHOT_DIR);
    console.log(`Snapshot saved: ${filepath}`);
    return;
  }

  if (args.action === 'info') {
    const snap = latestSnapshot(SNAPSHOT_DIR, args.label);
    if (!snap) {
      console.error(`No snapshots found for label: ${args.label}`);
      process.exit(1);
    }
    reportSnapshotInfo(snap);
    return;
  }

  if (args.action === 'diff') {
    if (!args.file) throw new Error('--file is required for diff action');
    const configs = loadConfigs(args.file);
    const current = { timestamp: new Date().toISOString(), label: args.label, config: configs[0] };
    const previous = latestSnapshot(SNAPSHOT_DIR, args.label);
    if (!previous) {
      console.error(`No previous snapshot found for label: ${args.label}`);
      process.exit(1);
    }
    reportSnapshotDiff(previous, current);
  }
}
