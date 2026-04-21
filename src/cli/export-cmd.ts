import { loadConfigs } from "../config/loader";
import { parseArgs } from "./args";
import { exportConfig, exportBothConfigs } from "../config/export";
import { reportExportResult, reportExportBoth, reportExportError } from "../output/export-reporter";
import { maskConfig } from "../config/mask";

/**
 * Handles the `export` subcommand.
 *
 * Exports one or both environment configs to a specified format and
 * optional output file. Supports masking sensitive values before export.
 *
 * Usage:
 *   stackdiff export --env staging --format json --out staging.json
 *   stackdiff export --format dotenv --mask
 *   stackdiff export --both --format json --out configs/
 */
export async function runExportCmd(argv: string[]): Promise<void> {
  const args = parseArgs(argv);

  const format = (args.format as string) ?? "dotenv";
  const outPath = (args.out as string) ?? null;
  const shouldMask = Boolean(args.mask);
  const exportBoth = Boolean(args.both);
  const env = (args.env as string) ?? null;

  let configs: { staging: Record<string, string>; production: Record<string, string> };

  try {
    configs = await loadConfigs(args);
  } catch (err) {
    reportExportError(`Failed to load configs: ${(err as Error).message}`);
    process.exit(1);
  }

  const staging = shouldMask ? maskConfig(configs.staging) : configs.staging;
  const production = shouldMask ? maskConfig(configs.production) : configs.production;

  if (exportBoth) {
    try {
      const results = await exportBothConfigs(
        { staging, production },
        format,
        outPath ?? "."
      );
      reportExportBoth(results, format, outPath ?? ".");
    } catch (err) {
      reportExportError(`Export failed: ${(err as Error).message}`);
      process.exit(1);
    }
    return;
  }

  // Single env export
  const targetEnv = env ?? "staging";
  const config = targetEnv === "production" ? production : staging;

  try {
    const result = await exportConfig(config, format, outPath);
    reportExportResult(result, targetEnv, format, outPath);
  } catch (err) {
    reportExportError(`Export failed: ${(err as Error).message}`);
    process.exit(1);
  }
}
