import { loadConfigs } from './loader';
import { diffConfigs, filterDiff } from './diff';
import { maskConfig } from './mask';
import { interpolateConfig } from './interpolate';

export interface CompareOptions {
  stagingPath: string;
  productionPath: string;
  maskSensitive?: boolean;
  interpolate?: boolean;
  onlyChanged?: boolean;
  keys?: string[];
}

export interface CompareResult {
  staging: Record<string, string>;
  production: Record<string, string>;
  diff: ReturnType<typeof diffConfigs>;
  maskedKeys: string[];
  options: CompareOptions;
}

export async function compareConfigs(options: CompareOptions): Promise<CompareResult> {
  const { stagingPath, productionPath, maskSensitive, interpolate, onlyChanged, keys } = options;

  const { staging: rawStaging, production: rawProduction } = await loadConfigs(
    stagingPath,
    productionPath
  );

  let staging = rawStaging;
  let production = rawProduction;

  if (interpolate) {
    staging = interpolateConfig(staging);
    production = interpolateConfig(production);
  }

  const maskedKeys: string[] = [];

  if (maskSensitive) {
    const { masked: maskedStaging, keys: sk } = maskConfig(staging);
    const { masked: maskedProduction, keys: pk } = maskConfig(production);
    staging = maskedStaging;
    production = maskedProduction;
    const combined = new Set([...sk, ...pk]);
    maskedKeys.push(...combined);
  }

  let diff = diffConfigs(staging, production);

  if (onlyChanged) {
    diff = filterDiff(diff, 'changed');
  }

  if (keys && keys.length > 0) {
    diff = diff.filter((entry) => keys.includes(entry.key));
  }

  return { staging, production, diff, maskedKeys, options };
}

export function compareSummary(result: CompareResult): string {
  const total = result.diff.length;
  const changed = result.diff.filter((d) => d.status === 'changed').length;
  const added = result.diff.filter((d) => d.status === 'added').length;
  const removed = result.diff.filter((d) => d.status === 'removed').length;
  return `Total: ${total} | Changed: ${changed} | Added: ${added} | Removed: ${removed}`;
}
