import { EnvConfig } from './loader';

export interface TagMap {
  [key: string]: string[];
}

export interface TagResult {
  tagged: Record<string, string[]>;
  untagged: string[];
  tagMap: TagMap;
}

/**
 * Tag config keys with user-defined labels based on pattern matching.
 */
export function tagConfig(config: EnvConfig, tagMap: TagMap): TagResult {
  const tagged: Record<string, string[]> = {};
  const taggedKeys = new Set<string>();

  for (const [tag, patterns] of Object.entries(tagMap)) {
    for (const key of Object.keys(config)) {
      const matches = patterns.some((pattern) => {
        if (pattern.includes('*')) {
          const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
          return regex.test(key);
        }
        return key === pattern || key.startsWith(pattern);
      });

      if (matches) {
        if (!tagged[key]) tagged[key] = [];
        tagged[key].push(tag);
        taggedKeys.add(key);
      }
    }
  }

  const untagged = Object.keys(config).filter((k) => !taggedKeys.has(k));

  return { tagged, untagged, tagMap };
}

export function tagBothConfigs(
  staging: EnvConfig,
  production: EnvConfig,
  tagMap: TagMap
): { staging: TagResult; production: TagResult } {
  return {
    staging: tagConfig(staging, tagMap),
    production: tagConfig(production, tagMap),
  };
}

export function loadTagMapFromEnv(env: Record<string, string> = process.env as Record<string, string>): TagMap {
  const tagMap: TagMap = {};
  const prefix = 'STACKDIFF_TAG_';

  for (const [key, value] of Object.entries(env)) {
    if (key.startsWith(prefix)) {
      const tag = key.slice(prefix.length).toLowerCase();
      tagMap[tag] = value.split(',').map((p) => p.trim()).filter(Boolean);
    }
  }

  return tagMap;
}
