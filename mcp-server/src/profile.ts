import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

/** Canonical public repo for the workbench profile. */
export const REPO_URL = "https://github.com/simonmak-ascent/opencode-workbench.git";
export const REPO_WEB = "https://github.com/simonmak-ascent/opencode-workbench";
export const RAW_BASE = "https://raw.githubusercontent.com/simonmak-ascent/opencode-workbench/main";

/** Root of the installed package (repo root when run from a checkout). */
export function packageRoot(): string {
  // Compiled layout: <root>/mcp-server/dist/profile.js -> <root>
  const here = dirname(fileURLToPath(import.meta.url));
  return resolve(here, "..", "..");
}

function readLocal(relPath: string): string | undefined {
  const p = resolve(packageRoot(), relPath);
  try {
    return existsSync(p) ? readFileSync(p, "utf8") : undefined;
  } catch {
    return undefined;
  }
}

async function fetchRemote(relPath: string): Promise<string | undefined> {
  try {
    const res = await fetch(`${RAW_BASE}/${relPath}`);
    if (!res.ok) return undefined;
    return await res.text();
  } catch {
    return undefined;
  }
}

/**
 * Load the canonical workbench `opencode.json`. Prefers the copy shipped inside
 * the package (a checkout / npm install), and falls back to fetching the public
 * repo so a bare `npx` run still works.
 */
export async function loadBaseConfig(): Promise<Record<string, unknown>> {
  const local = readLocal("opencode.json");
  if (local) return JSON.parse(local) as Record<string, unknown>;
  const remote = await fetchRemote("opencode.json");
  if (remote) return JSON.parse(remote) as Record<string, unknown>;
  throw new Error(
    `Could not load the workbench profile from the package or ${RAW_BASE}/opencode.json`,
  );
}

/** Load the connector manifest, if present. */
export async function loadConnectorManifest(): Promise<Record<string, unknown> | undefined> {
  const local = readLocal("connector.json");
  if (local) return JSON.parse(local) as Record<string, unknown>;
  const remote = await fetchRemote("connector.json");
  return remote ? (JSON.parse(remote) as Record<string, unknown>) : undefined;
}

/** Collect every `{env:NAME}` placeholder referenced by a rendered config. */
export function extractEnvVars(config: unknown): string[] {
  const found = new Set<string>();
  const walk = (node: unknown): void => {
    if (typeof node === "string") {
      for (const m of node.matchAll(/\{env:([A-Z0-9_]+)\}/g)) {
        if (m[1]) found.add(m[1]);
      }
      return;
    }
    if (Array.isArray(node)) {
      node.forEach(walk);
      return;
    }
    if (node && typeof node === "object") {
      Object.values(node).forEach(walk);
    }
  };
  walk(config);
  return [...found].sort();
}

/** Render the `~/.env.workbench` template (names only, never values). */
export function renderEnvTemplate(vars: string[]): string {
  const header = [
    "# ~/.env.workbench — workbench secrets template",
    "# Fill in values, then: chmod 600 ~/.env.workbench",
    "# This file is sourced by ~/.bashrc and never committed.",
    "",
  ];
  return header.concat(vars.map((v) => `${v}=`)).join("\n") + "\n";
}
