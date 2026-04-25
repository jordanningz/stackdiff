import { Config } from './loader';

export interface ScoreWeights {
  missingKeys: number;
  extraKeys: number;
  emptyValues: number;
  longValues: number;
  duplicateValues: number;
}

export interface ScoreResult {
  score: number;
  maxScore: number;
  pct: number;
  penalties: ScorePenalty[];
}

export interface ScorePenalty {
  key: string;
  reason: string;
  points: number;
}

const DEFAULT_WEIGHTS: ScoreWeights = {
  missingKeys: 10,
  extraKeys: 5,
  emptyValues: 8,
  longValues: 2,
  duplicateValues: 3,
};

export function scoreConfig(
  config: Config,
  reference: Config,
  weights: Partial<ScoreWeights> = {}
): ScoreResult {
  const w = { ...DEFAULT_WEIGHTS, ...weights };
  const penalties: ScorePenalty[] = [];

  const refKeys = new Set(Object.keys(reference));
  const cfgKeys = new Set(Object.keys(config));

  for (const key of refKeys) {
    if (!cfgKeys.has(key)) {
      penalties.push({ key, reason: 'missing key', points: w.missingKeys });
    }
  }

  for (const key of cfgKeys) {
    if (!refKeys.has(key)) {
      penalties.push({ key, reason: 'extra key not in reference', points: w.extraKeys });
    }
    const val = config[key];
    if (val === '' || val === undefined || val === null) {
      penalties.push({ key, reason: 'empty value', points: w.emptyValues });
    } else if (String(val).length > 512) {
      penalties.push({ key, reason: 'value exceeds 512 chars', points: w.longValues });
    }
  }

  const values = Object.values(config).map(String);
  const seen = new Map<string, string>();
  for (const [key, val] of Object.entries(config)) {
    const strVal = String(val);
    if (strVal && seen.has(strVal)) {
      penalties.push({ key, reason: `duplicate value with '${seen.get(strVal)}'`, points: w.duplicateValues });
    } else {
      seen.set(strVal, key);
    }
  }

  const totalPenalty = penalties.reduce((sum, p) => sum + p.points, 0);
  const maxScore = 100;
  const score = Math.max(0, maxScore - totalPenalty);
  const pct = Math.round((score / maxScore) * 100);

  return { score, maxScore, pct, penalties };
}

export function scoreBothConfigs(
  staging: Config,
  production: Config,
  reference: Config,
  weights?: Partial<ScoreWeights>
): { staging: ScoreResult; production: ScoreResult } {
  return {
    staging: scoreConfig(staging, reference, weights),
    production: scoreConfig(production, reference, weights),
  };
}
