import { ExportResult } from '../config/export';
import { green, dim, yellow } from './color';

export function reportExportResult(result: ExportResult): void {
  const kb = (result.bytesWritten / 1024).toFixed(2);
  console.log(
    green('✔') +
      ` Exported ${result.keyCount} keys to ${result.outputPath}` +
      dim(` [${result.format}, ${kb} KB]`)
  );
}

export function reportExportBoth(
  staging: ExportResult,
  production: ExportResult
): void {
  console.log(yellow('→') + ' Exporting staging and production configs...');
  reportExportResult(staging);
  reportExportResult(production);
  console.log(
    dim(
      `Total: ${staging.keyCount + production.keyCount} keys, ` +
        `${((staging.bytesWritten + production.bytesWritten) / 1024).toFixed(2)} KB written`
    )
  );
}

export function reportExportError(outputPath: string, error: unknown): void {
  const msg = error instanceof Error ? error.message : String(error);
  console.error(`Failed to export to ${outputPath}: ${msg}`);
}
