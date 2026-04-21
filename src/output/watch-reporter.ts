import { diffConfigs } from '../config/diff';
import { colorize, green, yellow, red, dim } from './color';

export function reportWatchStart(stagingPath: string, productionPath: string, interval: number): void {
  console.log(colorize(`Watching for config changes...`, 'cyan'));
  console.log(dim(`  staging:    ${stagingPath}`));
  console.log(dim(`  production: ${productionPath}`));
  console.log(dim(`  poll interval: ${interval}ms`));
  console.log();
}

export function reportWatchChange(
  diff: ReturnType<typeof diffConfigs>,
  timestamp: Date = new Date()
): void {
  const ts = timestamp.toISOString();
  const addedCount = Object.keys(diff.added).length;
  const removedCount = Object.keys(diff.removed).length;
  const changedCount = Object.keys(diff.changed).length;

  console.log(colorize(`[${ts}] Config change detected`, 'yellow'));

  if (addedCount > 0) {
    console.log(green(`  + ${addedCount} added`));
  }
  if (removedCount > 0) {
    console.log(red(`  - ${removedCount} removed`));
  }
  if (changedCount > 0) {
    console.log(yellow(`  ~ ${changedCount} changed`));
  }
  if (addedCount + removedCount + changedCount === 0) {
    console.log(dim('  (no key-level differences)'));
  }
  console.log();
}

export function reportWatchError(err: Error): void {
  console.error(red(`[watch error] ${err.message}`));
}

export function reportWatchStop(): void {
  console.log(dim('\nWatch stopped.'));
}
