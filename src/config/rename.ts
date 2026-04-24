export interface RenameMap {
  [oldKey: string]: string;
}

export interface RenameResult {
  config: Record<string, string>;
  renamed: Array<{ from: string; to: string }>;
  notFound: string[];
}

export function renameKeys(
  config: Record<string, string>,
  renameMap: RenameMap
): RenameResult {
  const result: Record<string, string> = { ...config };
  const renamed: Array<{ from: string; to: string }> = [];
  const notFound: string[] = [];

  for (const [oldKey, newKey] of Object.entries(renameMap)) {
    if (oldKey in result) {
      result[newKey] = result[oldKey];
      delete result[oldKey];
      renamed.push({ from: oldKey, to: newKey });
    } else {
      notFound.push(oldKey);
    }
  }

  return { config: result, renamed, notFound };
}

export function renameBothConfigs(
  staging: Record<string, string>,
  production: Record<string, string>,
  renameMap: RenameMap
): { staging: RenameResult; production: RenameResult } {
  return {
    staging: renameKeys(staging, renameMap),
    production: renameKeys(production, renameMap),
  };
}

export function loadRenameMapFromEnv(raw: string): RenameMap {
  const map: RenameMap = {};
  for (const pair of raw.split(',')) {
    const [from, to] = pair.trim().split(':');
    if (from && to) {
      map[from.trim()] = to.trim();
    }
  }
  return map;
}
