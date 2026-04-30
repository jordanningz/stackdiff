import { EnvTypeResult, EnvCategory } from '../config/env-type';
import { green, yellow, red, dim, bold } from './color';

function categoryColor(category: EnvCategory): (s: string) => string {
  switch (category) {
    case 'production': return red;
    case 'staging': return yellow;
    case 'development': return green;
    case 'test': return dim;
    default: return dim;
  }
}

function confidenceBar(confidence: number, width = 10): string {
  const filled = Math.round(confidence * width);
  return '[' + '█'.repeat(filled) + '░'.repeat(width - filled) + ']';
}

export function reportEnvTypeResult(label: string, result: EnvTypeResult): void {
  const color = categoryColor(result.category);
  const bar = confidenceBar(result.confidence);
  const pct = (result.confidence * 100).toFixed(0) + '%';

  console.log(`${bold(label)}`);
  console.log(`  Category  : ${color(result.category)}`);
  console.log(`  Confidence: ${bar} ${pct}`);
  if (result.signals.length > 0) {
    console.log(`  Signals   : ${dim(result.signals.join(', '))}`);
  } else {
    console.log(`  Signals   : ${dim('none')}`);
  }
}

export function reportBothEnvTypes(
  stagingResult: EnvTypeResult,
  productionResult: EnvTypeResult
): void {
  reportEnvTypeResult('staging', stagingResult);
  console.log();
  reportEnvTypeResult('production', productionResult);
  console.log();

  const match = stagingResult.category === productionResult.category;
  if (match && stagingResult.category !== 'unknown') {
    console.log(yellow('⚠  Both environments detected as the same type: ' + stagingResult.category));
  } else if (stagingResult.category === 'production' || productionResult.category === 'staging') {
    console.log(red('✖  Environment types appear swapped!'));
  } else {
    console.log(green('✔  Environment types look correct'));
  }
}
