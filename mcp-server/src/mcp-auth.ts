/**
 * Credential classification for MCP server entries.
 *
 * The workbench never reads secret *values*; it only needs to know which
 * environment variables a server references so it can disable servers whose
 * credentials the target has not supplied, and report the degradation. Values
 * are never parsed, stored, or logged.
 */

export type AuthMethod = "none" | "key" | "oauth";

/**
 * Env vars that are genuinely optional for a server. A server is not disabled
 * when only these are missing (a subset of its tools degrades instead).
 */
export const OPTIONAL_ENV: ReadonlySet<string> = new Set([
  "RESEARCH_CONTACT",
  "FRED_API_KEY",
  "COMPANIES_HOUSE_API_KEY",
]);

/** Collect every `{env:VAR}` placeholder referenced inside an MCP entry. */
export function requiredEnvVars(entry: unknown): string[] {
  const found = new Set<string>();
  walk(entry, found);
  return [...found].sort();
}

function walk(node: unknown, found: Set<string>): void {
  if (typeof node === "string") {
    for (const m of node.matchAll(/\{env:([A-Z0-9_]+)\}/g)) if (m[1]) found.add(m[1]);
    return;
  }
  if (Array.isArray(node)) {
    node.forEach((n) => walk(n, found));
    return;
  }
  if (node && typeof node === "object") {
    Object.values(node).forEach((n) => walk(n, found));
  }
}

/** Classify how an MCP entry authenticates. */
export function authMethod(entry: Record<string, unknown>): AuthMethod {
  if (entry.type === "remote") {
    // opencode marks non-OAuth remotes with `oauth: false`.
    return entry.oauth === false ? "key" : "oauth";
  }
  return requiredEnvVars(entry).length > 0 ? "key" : "none";
}

export interface McpHealth {
  id: string;
  auth: AuthMethod;
  requiredEnv: string[];
  /** Required env vars the target does not provide (excluding optional ones). */
  missingEnv: string[];
  /** True when the server should be disabled for this target. */
  degraded: boolean;
}

/**
 * Decide whether an MCP entry should be enabled for a target, given the set of
 * environment variable names present on that target.
 */
export function assessMcp(
  id: string,
  entry: Record<string, unknown>,
  presentEnv: ReadonlySet<string>,
): McpHealth {
  const requiredEnv = requiredEnvVars(entry);
  const missingEnv = requiredEnv.filter((v) => !presentEnv.has(v) && !OPTIONAL_ENV.has(v));
  return { id, auth: authMethod(entry), requiredEnv, missingEnv, degraded: missingEnv.length > 0 };
}
