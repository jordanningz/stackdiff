import { TagResult, TagMap } from '../config/tag';
import { dim, yellow, green, bold } from './color';

export function reportTagResult(result: TagResult, label = 'Config'): void {
  const { tagged, untagged } = result;
  const taggedKeys = Object.keys(tagged);

  console.log(bold(`\n${label} Tag Report`));
  console.log(dim('─'.repeat(40)));

  if (taggedKeys.length === 0) {
    console.log(dim('  No keys matched any tags.'));
  } else {
    const byTag: Record<string, string[]> = {};
    for (const [key, tags] of Object.entries(tagged)) {
      for (const tag of tags) {
        if (!byTag[tag]) byTag[tag] = [];
        byTag[tag].push(key);
      }
    }

    for (const [tag, keys] of Object.entries(byTag)) {
      console.log(yellow(`  [${tag}]`));
      for (const key of keys) {
        console.log(green(`    ✓ ${key}`));
      }
    }
  }

  if (untagged.length > 0) {
    console.log(dim(`\n  Untagged (${untagged.length}): ${untagged.join(', ')}`))
  }
}

export function reportTagSummary(tagMap: TagMap, staging: TagResult, production: TagResult): void {
  const tags = Object.keys(tagMap);
  console.log(bold('\nTag Summary'));
  console.log(dim('─'.repeat(40)));
  console.log(dim(`  Tags defined : ${tags.length} (${tags.join(', ')})`));
  console.log(dim(`  Staging      : ${Object.keys(staging.tagged).length} tagged, ${staging.untagged.length} untagged`));
  console.log(dim(`  Production   : ${Object.keys(production.tagged).length} tagged, ${production.untagged.length} untagged`));
}
