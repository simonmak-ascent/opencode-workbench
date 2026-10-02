#!/usr/bin/env node
/**
 * Workbench self-test — verify a deployed/cloned box actually works.
 *
 * Dependency-free (Node >= 20). Checks, across capability classes:
 *   providers  — configured model providers respond with the target's keys
 *   mcp        — every enabled MCP server answers initialize + tools/list
 *   skills     — every SKILL.md parses and documents itself
 *   tools      — expected CLIs are on PATH
 *   infra      — Docker containers (optional)
 *   remote     — the hosted workbench + primary-sources + vdd MCP endpoints
 *
 * Never reads or prints secret values: it only checks whether env vars are set
 * and reports HTTP status codes.
 *
 * Usage: node scripts/selftest/run-selftest.mjs [--json] [--scope all|providers|mcp|skills|tools|infra|remote]
 */
import { spawn } from "node:child_process";
import { readFileSync, existsSync, readdirSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");
const CONFIG_PATH = process.env.WB_CONFIG || resolve(ROOT, "opencode.json");
const args = process.argv.slice(2);
const asJson = args.includes("--json");
const scopeArg = args.find((a) => a.startsWith("--scope"));
const scope = scopeArg ? scopeArg.split("=")[1] || args[args.indexOf(scopeArg) + 1] : "all";

const results = [];
function record(cls, name, status, detail) {
  results.push({ class: cls, name, status, detail });
  if (!asJson) {
    const badge = { PASS: "\x1b[32mPASS\x1b[0m", WARN: "\x1b[33mWARN\x1b[0m", FAIL: "\x1b[31mFAIL\x1b[0m", SKIP: "\x1b[90mSKIP\x1b[0m" }[status];
    process.stdout.write(`  ${badge}  [${cls}] ${name}${detail ? ` — ${detail}` : ""}\n`);
  }
}

const envPresent = (name) => Boolean(process.env[name]);
const config = () => JSON.parse(readFileSync(CONFIG_PATH, "utf8"));

// ------------------------------------------------------------------ providers
async function checkProviders() {
  if (!asJson) process.stdout.write("── Providers ──\n");
  const providers = config().provider || {};
  for (const [id, p] of Object.entries(providers)) {
    const envVars = p.env || [];
    const keyPresent = envVars.length === 0 || envVars.some(envPresent);
    if (!keyPresent) {
      record("providers", id, "SKIP", `missing ${envVars.join(", ")}`);
      continue;
    }
    const base = p.api || "";
    try {
      let ok = false;
      let status = 0;
      if (!envVars.length) ok = true;
      else if (base && id !== "perplexity") {
        const res = await fetch(`${base.replace(/\/$/, "")}/models`, {
          headers: { Authorization: `Bearer ${process.env[envVars[0]]}` },
          signal: AbortSignal.timeout(15000),
        });
        status = res.status;
        ok = res.ok;
      } else {
        const res = await fetch(`${base.replace(/\/$/, "")}/chat/completions`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env[envVars[0]]}` },
          body: JSON.stringify({ model: "sonar", messages: [{ role: "user", content: "hi" }], max_tokens: 1 }),
          signal: AbortSignal.timeout(20000),
        });
        status = res.status;
        ok = res.ok;
      }
      record("providers", id, ok ? "PASS" : "FAIL", ok ? "reachable" : `HTTP ${status}`);
    } catch (e) {
      record("providers", id, "FAIL", (e && e.message) || String(e));
    }
  }
}

// ------------------------------------------------------------------------- mcp
function requiredEnv(entry) {
  const found = new Set();
  (function walk(n) {
    if (typeof n === "string") for (const m of n.matchAll(/\{env:([A-Z0-9_]+)\}/g)) found.add(m[1]);
    else if (Array.isArray(n)) n.forEach(walk);
    else if (n && typeof n === "object") Object.values(n).forEach(walk);
  })(entry);
  return [...found];
}

async function httpToolsList(url, headers = {}) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json, text/event-stream", ...headers },
    body: JSON.stringify([
      { jsonrpc: "2.0", id: 1, method: "initialize", params: { protocolVersion: "2025-06-18", capabilities: {}, clientInfo: { name: "selftest", version: "1" } } },
      { jsonrpc: "2.0", id: 2, method: "tools/list" },
    ]),
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const body = await res.json();
  const list = Array.isArray(body) ? body : [body];
  const tools = list.find((m) => m.id === 2)?.result?.tools;
  return tools ? tools.length : 0;
}

function stdioToolsList(command, cmdArgs, env, timeoutMs = 25000) {
  return new Promise((resolvePromise) => {
    const child = spawn(command, cmdArgs, { env: { ...process.env, ...env }, stdio: ["pipe", "pipe", "pipe"] });
    let buf = "";
    let done = false;
    const finish = (tools, err) => {
      if (done) return;
      done = true;
      clearTimeout(timer);
      try { child.kill("SIGKILL"); } catch {}
      resolvePromise(err ? { err } : { tools });
    };
    const timer = setTimeout(() => finish(null, "timeout"), timeoutMs);
    child.stdout.on("data", (d) => {
      buf += d.toString();
      let idx;
      while ((idx = buf.indexOf("\n")) !== -1) {
        const line = buf.slice(0, idx).trim();
        buf = buf.slice(idx + 1);
        if (!line) continue;
        try {
          const msg = JSON.parse(line);
          if (msg.id === 2 && msg.result?.tools) finish(msg.result.tools.length);
        } catch {}
      }
    });
    child.on("error", (e) => finish(null, e.message));
    child.stdin.write(JSON.stringify({ jsonrpc: "2.0", id: 1, method: "initialize", params: { protocolVersion: "2024-11-05", capabilities: {}, clientInfo: { name: "selftest", version: "1" } } }) + "\n");
    child.stdin.write(JSON.stringify({ jsonrpc: "2.0", id: 2, method: "tools/list" }) + "\n");
  });
}

async function checkMcp() {
  if (!asJson) process.stdout.write("── MCP servers ──\n");
  const mcp = config().mcp || {};
  for (const [id, entry] of Object.entries(mcp)) {
    if (entry.enabled === false) {
      record("mcp", id, "SKIP", entry._disabled_reason || "disabled");
      continue;
    }
    const missing = requiredEnv(entry).filter((v) => !envPresent(v));
    if (missing.length) {
      record("mcp", id, "SKIP", `missing ${missing.join(", ")}`);
      continue;
    }
    try {
      if (entry.type === "remote") {
        const headers = {};
        for (const [k, v] of Object.entries(entry.headers || {})) {
          const m = /\{env:([A-Z0-9_]+)\}/.exec(String(v));
          if (m) headers[k] = String(v).replace(m[0], process.env[m[1]] || "");
        }
        const n = await httpToolsList(entry.url, headers);
        record("mcp", id, n > 0 ? "PASS" : "WARN", `${n} tools`);
      } else {
        const [cmd, ...rest] = entry.command || [];
        const env = {};
        for (const [k, v] of Object.entries(entry.environment || {})) {
          const m = /\{env:([A-Z0-9_]+)\}/.exec(String(v));
          if (m) env[k] = process.env[m[1]] || "";
        }
        const r = await stdioToolsList(cmd, rest, env);
        record("mcp", id, r.err ? "FAIL" : r.tools > 0 ? "PASS" : "WARN", r.err || `${r.tools} tools`);
      }
    } catch (e) {
      record("mcp", id, "FAIL", (e && e.message) || String(e));
    }
  }
}

// ---------------------------------------------------------------------- skills
function checkSkills() {
  if (!asJson) process.stdout.write("── Skills ──\n");
  const dir = resolve(ROOT, ".opencode", "skills");
  if (!existsSync(dir)) return record("skills", "directory", "FAIL", "missing .opencode/skills");
  const dirs = readdirSync(dir, { withFileTypes: true }).filter((d) => d.isDirectory());
  let ok = 0;
  for (const d of dirs) {
    const p = resolve(dir, d.name, "SKILL.md");
    if (!existsSync(p)) { record("skills", d.name, "WARN", "no SKILL.md"); continue; }
    const content = readFileSync(p, "utf8");
    const hasName = /^name:\s*\S+/m.test(content);
    const hasDesc = /^description:\s*[\s\S]+?(\n\w|$)/m.test(content);
    if (hasName && hasDesc) ok++;
    else record("skills", d.name, "WARN", "missing name/description frontmatter");
  }
  record("skills", "total", "PASS", `${ok}/${dirs.length} documented`);
}

// ----------------------------------------------------------------------- tools
const TOOLS = ["git", "curl", "node", "npm", "pnpm", "uv", "gh", "opencode", "jq", "pandoc", "docker"];
function checkTools() {
  if (!asJson) process.stdout.write("── Tools ──\n");
  for (const t of TOOLS) {
    const found = (process.env.PATH || "").split(":").some((p) => existsSync(resolve(p, t)));
    record("tools", t, found ? "PASS" : "WARN", found ? "on PATH" : "not found");
  }
}

// ----------------------------------------------------------------------- infra
async function checkInfra() {
  if (!asJson) process.stdout.write("── Infra ──\n");
  for (const c of ["pg-memory", "browserless"]) {
    const r = await new Promise((res) => {
      const p = spawn("docker", ["ps", "--format", "{{.Names}}"]);
      let out = "";
      p.stdout.on("data", (d) => (out += d.toString()));
      p.on("error", () => res(null));
      p.on("close", () => res(out));
    });
    if (r === null) { record("infra", c, "SKIP", "docker unavailable"); continue; }
    const running = r.split("\n").includes(c);
    record("infra", c, running ? "PASS" : "WARN", running ? "running" : "not running");
  }
}

// ---------------------------------------------------------------------- remote
const REMOTE = [
  ["workbench", "https://opencode-workbench.simonmak.com/mcp"],
  ["primary-sources", "https://primary-sources-mcp.vercel.app/mcp"],
  ["vdd", "https://vdd.simonmak.com/api/mcp"],
];
async function checkRemote() {
  if (!asJson) process.stdout.write("── Remote endpoints ──\n");
  for (const [name, url] of REMOTE) {
    try {
      const n = await httpToolsList(url);
      record("remote", name, n > 0 ? "PASS" : "WARN", `${n} tools`);
    } catch (e) {
      record("remote", name, "FAIL", (e && e.message) || String(e));
    }
  }
}

// ------------------------------------------------------------------------ main
const scopes = {
  providers: checkProviders,
  mcp: checkMcp,
  skills: checkSkills,
  tools: checkTools,
  infra: checkInfra,
  remote: checkRemote,
};

(async () => {
  if (!asJson) process.stdout.write(`\nWorkbench self-test  (config: ${CONFIG_PATH})\n\n`);
  const chosen = scope === "all" ? Object.keys(scopes) : scope.split(",");
  for (const s of chosen) if (scopes[s]) await scopes[s]();
  const summary = {
    generatedAt: new Date().toISOString(),
    config: CONFIG_PATH,
    counts: results.reduce((a, r) => ((a[r.status] = (a[r.status] || 0) + 1), a), {}),
    results,
  };
  const reportPath = process.env.WB_SELFTEST_REPORT || resolve(ROOT, "selftest-report.json");
  try { writeFileSync(reportPath, JSON.stringify(summary, null, 2)); } catch {}
  if (asJson) process.stdout.write(JSON.stringify(summary, null, 2) + "\n");
  else process.stdout.write(`\nSummary: ${JSON.stringify(summary.counts)}  (report: ${reportPath})\n`);
  process.exit((summary.counts.FAIL || 0) > 0 ? 1 : 0);
})();
