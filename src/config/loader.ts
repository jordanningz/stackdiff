import * as fs from "fs";
import * as path from "path";

export interface EnvConfig {
  [key: string]: string;
}

export function parseEnvFile(filePath: string): EnvConfig {
  const resolved = path.resolve(filePath);
  if (!fs.existsSync(resolved)) {
    throw new Error(`Config file not found: ${resolved}`);
  }

  const content = fs.readFileSync(resolved, "utf-8");
  const config: EnvConfig = {};

  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const eqIndex = trimmed.indexOf("=");
    if (eqIndex === -1) continue;

    const key = trimmed.substring(0, eqIndex).trim();
    const value = trimmed.substring(eqIndex + 1).trim().replace(/^["']|["']$/g, "");

    if (key) {
      config[key] = value;
    }
  }

  return config;
}

export function loadConfigs(
  stagingPath: string,
  productionPath: string
): { staging: EnvConfig; production: EnvConfig } {
  return {
    staging: parseEnvFile(stagingPath),
    production: parseEnvFile(productionPath),
  };
}
