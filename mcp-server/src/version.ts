import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

/**
 * The package version, read from the nearest `package.json` so the MCP
 * `serverInfo.version` never drifts from the released package. Works both from
 * a checkout (`mcp-server/dist/version.js` → repo root) and from an installed
 * package (`.../opencode-workbench/mcp-server/dist/version.js` → package root).
 */
export function packageVersion(): string {
  const here = dirname(fileURLToPath(import.meta.url));
  for (const rel of ["../package.json", "../../package.json"]) {
    try {
      const pkg = JSON.parse(readFileSync(resolve(here, rel), "utf8")) as {
        version?: unknown;
      };
      if (typeof pkg.version === "string" && pkg.version.length > 0) return pkg.version;
    } catch {
      // try the next candidate
    }
  }
  return "0.0.0";
}

export const VERSION = packageVersion();
