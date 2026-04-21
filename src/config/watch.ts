import * as fs from 'fs';
import * as path from 'path';
import { loadConfigs } from './loader';
import { diffConfigs } from './diff';

export interface WatchOptions {
  stagingPath: string;
  productionPath: string;
  interval?: number;
  onChange: (diff: ReturnType<typeof diffConfigs>) => void;
  onError?: (err: Error) => void;
}

export interface WatchHandle {
  stop: () => void;
  isRunning: () => boolean;
}

export function watchConfigs(options: WatchOptions): WatchHandle {
  const { stagingPath, productionPath, interval = 2000, onChange, onError } = options;
  let running = true;
  let lastHash = '';

  function hashDiff(diff: ReturnType<typeof diffConfigs>): string {
    return JSON.stringify(diff);
  }

  async function poll() {
    if (!running) return;
    try {
      const configs = await loadConfigs(stagingPath, productionPath);
      const diff = diffConfigs(configs.staging, configs.production);
      const hash = hashDiff(diff);
      if (hash !== lastHash) {
        lastHash = hash;
        onChange(diff);
      }
    } catch (err) {
      if (onError) onError(err as Error);
    }
    if (running) setTimeout(poll, interval);
  }

  poll();

  return {
    stop: () => { running = false; },
    isRunning: () => running,
  };
}

export function watchFiles(
  filePaths: string[],
  onChange: (changedFile: string) => void
): () => void {
  const watchers = filePaths.map((fp) =>
    fs.watch(path.resolve(fp), () => onChange(fp))
  );
  return () => watchers.forEach((w) => w.close());
}
