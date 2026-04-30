/**
 * Detects and categorizes the type/environment of a config
 * based on key patterns, values, and naming conventions.
 */

export type EnvCategory = 'production' | 'staging' | 'development' | 'test' | 'unknown';

export interface EnvTypeResult {
  category: EnvCategory;
  confidence: number; // 0–1
  signals: string[];
}

const PRODUCTION_SIGNALS: RegExp[] = [
  /prod/i,
  /production/i,
  /live/i,
  /release/i,
];

const STAGING_SIGNALS: RegExp[] = [
  /stag/i,
  /staging/i,
  /preprod/i,
  /pre-prod/i,
  /uat/i,
];

const DEV_SIGNALS: RegExp[] = [
  /dev/i,
  /development/i,
  /local/i,
  /localhost/i,
];

const TEST_SIGNALS: RegExp[] = [
  /test/i,
  /testing/i,
  /ci/i,
  /sandbox/i,
];

function matchSignals(value: string, patterns: RegExp[]): string[] {
  return patterns.filter(p => p.test(value)).map(p => p.source);
}

export function detectEnvType(config: Record<string, string>): EnvTypeResult {
  const allValues = Object.entries(config).flatMap(([k, v]) => [k, v]);
  const combined = allValues.join(' ');

  const prodMatches = matchSignals(combined, PRODUCTION_SIGNALS);
  const stagMatches = matchSignals(combined, STAGING_SIGNALS);
  const devMatches = matchSignals(combined, DEV_SIGNALS);
  const testMatches = matchSignals(combined, TEST_SIGNALS);

  const scores: [EnvCategory, number, string[]][] = [
    ['production', prodMatches.length, prodMatches],
    ['staging', stagMatches.length, stagMatches],
    ['development', devMatches.length, devMatches],
    ['test', testMatches.length, testMatches],
  ];

  scores.sort((a, b) => b[1] - a[1]);
  const [topCategory, topScore, topSignals] = scores[0];
  const totalSignals = scores.reduce((sum, s) => sum + s[1], 0);

  if (topScore === 0) {
    return { category: 'unknown', confidence: 0, signals: [] };
  }

  const confidence = Math.min(topScore / Math.max(totalSignals, 1), 1);
  return { category: topCategory, confidence: parseFloat(confidence.toFixed(2)), signals: topSignals };
}

export function detectBothEnvTypes(
  staging: Record<string, string>,
  production: Record<string, string>
): { staging: EnvTypeResult; production: EnvTypeResult } {
  return {
    staging: detectEnvType(staging),
    production: detectEnvType(production),
  };
}
