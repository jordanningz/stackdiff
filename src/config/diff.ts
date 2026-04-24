import { EnvConfig } from "./loader";

export type DiffStatus = "added" | "removed" | "changed" | "unchanged";

export interface DiffEntry {
  key: string;
  status: DiffStatus;
  stagingValue?: string;
  productionValue?: string;
}

export function diffConfigs(
  staging: EnvConfig,
  production: EnvConfig
): DiffEntry[] {
  const allKeys = new Set([...Object.keys(staging), ...Object.keys(production)]);
  const results: DiffEntry[] = [];

  for (const key of Array.from(allKeys).sort()) {
    const inStaging = key in staging;
    const inProduction = key in production;

    if (inStaging && !inProduction) {
      results.push({ key, status: "removed", stagingValue: staging[key] });
    } else if (!inStaging && inProduction) {
      results.push({ key, status: "added", productionValue: production[key] });
    } else if (staging[key] !== production[key]) {
      results.push({
        key,
        status: "changed",
        stagingValue: staging[key],
        productionValue: production[key],
      });
    } else {
      results.push({
        key,
        status: "unchanged",
        stagingValue: staging[key],
        productionValue: production[key],
      });
    }
  }

  return results;
}

export function filterDiff(
  entries: DiffEntry[],
  statuses: DiffStatus[]
): DiffEntry[] {
  return entries.filter((e) => statuses.includes(e.status));
}

/**
 * Returns a summary count of diff entries grouped by status.
 */
export function summarizeDiff(
  entries: DiffEntry[]
): Record<DiffStatus, number> {
  const summary: Record<DiffStatus, number> = {
    added: 0,
    removed: 0,
    changed: 0,
    unchanged: 0,
  };

  for (const entry of entries) {
    summary[entry.status]++;
  }

  return summary;
}
