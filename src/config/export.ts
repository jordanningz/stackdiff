import * as fs from 'fs';
import * as path from 'path';
import { formatOutput } from '../output/formatter';

export type ExportFormat = 'json' | 'dotenv' | 'table';

export interface ExportOptions {
  format: ExportFormat;
  outputPath: string;
  pretty?: boolean;
}

export interface ExportResult {
  outputPath: string;
  format: ExportFormat;
  bytesWritten: number;
  keyCount: number;
}

export function exportConfig(
  config: Record<string, string>,
  options: ExportOptions
): ExportResult {
  const dir = path.dirname(options.outputPath);
  if (dir && dir !== '.') {
    fs.mkdirSync(dir, { recursive: true });
  }

  const content = formatOutput(config, options.format);
  fs.writeFileSync(options.outputPath, content, 'utf8');

  return {
    outputPath: options.outputPath,
    format: options.format,
    bytesWritten: Buffer.byteLength(content, 'utf8'),
    keyCount: Object.keys(config).length,
  };
}

export function exportBothConfigs(
  staging: Record<string, string>,
  production: Record<string, string>,
  options: Omit<ExportOptions, 'outputPath'> & { outputDir: string }
): { staging: ExportResult; production: ExportResult } {
  const ext = options.format === 'json' ? 'json' : options.format === 'dotenv' ? 'env' : 'txt';

  const stagingResult = exportConfig(staging, {
    ...options,
    outputPath: path.join(options.outputDir, `staging.${ext}`),
  });

  const productionResult = exportConfig(production, {
    ...options,
    outputPath: path.join(options.outputDir, `production.${ext}`),
  });

  return { staging: stagingResult, production: productionResult };
}
