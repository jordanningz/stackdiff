import { loadConfigs } from "../config/loader";
import { parseArgs } from "./args";
import { promoteConfig, applyPromotion } from "../config/promote";
import { reportPromoteResult, reportPromoteSummary, reportPromoteError } from "../output/promote-reporter";
import { saveSnapshot } from "../config/snapshot";
import * as fs from "fs";

export async function runPromoteCmd(argv: string[]): Promise<void> {
  const args = parseArgs(argv);

  if (!args.staging || !args.production) {
    reportPromoteError("Both --staging and --production paths are required.");
    process.exit(1);
  }

  let configs: Awaited<ReturnType<typeof loadConfigs>>;
  try {
    configs = await loadConfigs(args.staging, args.production);
  } catch (err: unknown) {
    reportPromoteError((err as Error).message);
    process.exit(1);
  }

  const keys = args.keys ? String(args.keys).split(",").map((k) => k.trim()) : undefined;
  const overwrite = Boolean(args.overwrite);
  const dryRun = Boolean(args.dryRun);

  const result = promoteConfig(configs.staging, configs.production, { keys, overwrite, dryRun });

  reportPromoteResult(result);
  reportPromoteSummary(result);

  if (!dryRun && Object.keys(result.promoted).length > 0) {
    const updated = applyPromotion(configs.staging, configs.production, result);
    const lines = Object.entries(updated)
      .map(([k, v]) => `${k}=${v}`)
      .join("\n");
    fs.writeFileSync(args.production, lines + "\n", "utf-8");

    if (args.snapshot) {
      await saveSnapshot("production", updated);
    }
  }
}
