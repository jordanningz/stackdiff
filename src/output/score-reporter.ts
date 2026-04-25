import { ScoreResult, ScorePenalty } from '../config/score';
import { green, yellow, red, dim, bold } from './color';

function scoreColor(pct: number): (s: string) => string {
  if (pct >= 80) return green;
  if (pct >= 50) return yellow;
  return red;
}

function bar(pct: number, width = 20): string {
  const filled = Math.round((pct / 100) * width);
  const empty = width - filled;
  return '[' + '█'.repeat(filled) + dim('░'.repeat(empty)) + ']';
}

export function reportScorePenalty(penalty: ScorePenalty): void {
  const pts = red(`-${penalty.points}`);
  console.log(`  ${dim(penalty.key)}: ${penalty.reason} ${pts}`);
}

export function reportScoreResult(label: string, result: ScoreResult): void {
  const col = scoreColor(result.pct);
  const scoreStr = col(`${result.score}/${result.maxScore} (${result.pct}%)`);
  console.log(`\n${bold(label)} score: ${scoreStr} ${bar(result.pct)}`);
  if (result.penalties.length === 0) {
    console.log(`  ${green('No issues found.')}`);
  } else {
    console.log(`  ${result.penalties.length} issue(s):`);
    for (const p of result.penalties) {
      reportScorePenalty(p);
    }
  }
}

export function reportScoreSummary(
  staging: ScoreResult,
  production: ScoreResult
): void {
  const delta = production.score - staging.score;
  const deltaStr =
    delta > 0 ? green(`+${delta}`) : delta < 0 ? red(`${delta}`) : dim('±0');
  console.log(`\n${bold('Score comparison')}:`);
  console.log(`  Staging:    ${scoreColor(staging.pct)(String(staging.score))}`);
  console.log(`  Production: ${scoreColor(production.pct)(String(production.score))}`);
  console.log(`  Delta:      ${deltaStr}`);
}
