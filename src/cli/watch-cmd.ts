import { parseArgs } from './args';
import { watchConfigs } from '../config/watch';
import {
  reportWatchStart,
  reportWatchChange,
  reportWatchError,
  reportWatchStop,
} from '../output/watch-reporter';

export async function runWatchCmd(argv: string[]): Promise<void> {
  const args = parseArgs(argv);

  const stagingPath = args.staging ?? '.env.staging';
  const productionPath = args.production ?? '.env.production';
  const interval = args.interval ? parseInt(String(args.interval), 10) : 2000;

  reportWatchStart(stagingPath, productionPath, interval);

  const handle = watchConfigs({
    stagingPath,
    productionPath,
    interval,
    onChange(diff) {
      reportWatchChange(diff);
    },
    onError(err) {
      reportWatchError(err);
    },
  });

  function shutdown() {
    handle.stop();
    reportWatchStop();
    process.exit(0);
  }

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}
