import { loadConfigs } from "../config/loader";
import { encryptConfig, decryptConfig, encryptBothConfigs } from "../config/encrypt";
import {
  reportEncryptResult,
  reportDecryptResult,
  reportEncryptSummary,
  reportEncryptError,
} from "../output/encrypt-reporter";
import { parseArgs } from "./args";

export async function runEncryptCmd(argv: string[]): Promise<void> {
  const args = parseArgs(argv);
  const secret = process.env.STACKDIFF_ENCRYPT_SECRET;

  if (!secret) {
    console.error("Error: STACKDIFF_ENCRYPT_SECRET environment variable is required.");
    process.exit(1);
  }

  const mode: "encrypt" | "decrypt" = argv.includes("--decrypt") ? "decrypt" : "encrypt";
  const keysArg = argv.find((a) => a.startsWith("--keys="));
  const keys = keysArg ? keysArg.replace("--keys=", "").split(",") : undefined;
  const bothFlag = argv.includes("--both");

  try {
    const { staging, production } = await loadConfigs(args);

    if (mode === "encrypt") {
      if (bothFlag) {
        const { staging: encStaging, production: encProd } = encryptBothConfigs(
          staging,
          production,
          secret,
          keys
        );
        reportEncryptResult(staging, encStaging, "staging");
        reportEncryptSummary(staging, encStaging);
        reportEncryptResult(production, encProd, "production");
        reportEncryptSummary(production, encProd);
      } else {
        const result = encryptConfig(staging, secret, keys);
        reportEncryptResult(staging, result, "staging");
        reportEncryptSummary(staging, result);
      }
    } else {
      const result = decryptConfig(staging, secret);
      reportDecryptResult(result, "staging");
    }
  } catch (err) {
    reportEncryptError("(config)", err);
    process.exit(1);
  }
}
