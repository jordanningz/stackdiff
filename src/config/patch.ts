import { ParsedConfig } from './loader';

export type PatchOperation =
  | { op: 'set'; key: string; value: string }
  | { op: 'delete'; key: string }
  | { op: 'rename'; from: string; to: string };

export interface PatchResult {
  config: ParsedConfig;
  applied: PatchOperation[];
  skipped: PatchOperation[];
}

export function applyPatch(
  config: ParsedConfig,
  operations: PatchOperation[]
): PatchResult {
  const result: ParsedConfig = { ...config };
  const applied: PatchOperation[] = [];
  const skipped: PatchOperation[] = [];

  for (const op of operations) {
    if (op.op === 'set') {
      result[op.key] = op.value;
      applied.push(op);
    } else if (op.op === 'delete') {
      if (op.key in result) {
        delete result[op.key];
        applied.push(op);
      } else {
        skipped.push(op);
      }
    } else if (op.op === 'rename') {
      if (op.from in result) {
        result[op.to] = result[op.from];
        delete result[op.from];
        applied.push(op);
      } else {
        skipped.push(op);
      }
    }
  }

  return { config: result, applied, skipped };
}

export function parsePatchOps(raw: string[]): PatchOperation[] {
  return raw.map((entry) => {
    if (entry.startsWith('delete:')) {
      return { op: 'delete', key: entry.slice(7) };
    }
    if (entry.includes('=>')) {
      const [from, to] = entry.split('=>').map((s) => s.trim());
      return { op: 'rename', from, to };
    }
    const eqIdx = entry.indexOf('=');
    if (eqIdx === -1) throw new Error(`Invalid patch op: ${entry}`);
    return { op: 'set', key: entry.slice(0, eqIdx), value: entry.slice(eqIdx + 1) };
  });
}
