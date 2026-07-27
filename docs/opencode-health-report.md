# OpenCode Health Report

**Generated:** 2026-07-27
**OpenCode Version:** 1.18.5
**Binary:** `/home/node/.opencode/bin/opencode` (ELF 64-bit)

---

## A. Root Cause Analysis

### Primary Cause: All 17 Plugins Uninstalled

The OpenCode configuration declares **17 plugins**, but **zero are installed** in `~/.config/opencode/node_modules/`. The only installed package is `@opencode-ai/plugin@1.18.5`.

```
MISS   opencode-websearch-cited
MISS   @morphllm/opencode-morph-plugin
MISS   @nick-vi/opencode-type-inject
MISS   opencode-supermemory
MISS   @tarquinen/opencode-dcp
MISS   @f97/opencode-morph-fast-apply
MISS   opencode-helicone-session
MISS   opencode-goal-plugin
MISS   opencode-sentry-monitor
MISS   opencode-vibeguard
MISS   opencode-background-agents
MISS   @franlol/opencode-md-table-formatter
MISS   @zenobius/opencode-skillful
MISS   opencode-conductor
MISS   micode
MISS   @mohak34/opencode-notifier
MISS   opencode-wakatime
```

**Why `--pure` works:** The `--pure` flag explicitly skips loading external plugins, bypassing the entirety of the plugin resolution layer.

**Hypothesized hang mechanism:** OpenCode attempts to resolve/load plugins at startup. If any plugin resolution triggers an npm registry fetch, network resolution, or dynamic import that blocks without a timeout, the entire startup hangs. This is network-dependent, explaining why it's intermittent.

### Secondary Cause: MCP Server Startup Without Timeouts

Only **2 of 14 local MCP servers** have `timeout` configured:
- `perplexity`: 600000ms
- `brave-search`: 120000ms

The remaining 12 local MCP servers default to no timeout. If any child process hangs during initialization (e.g., saga MCP due to missing `DB_PATH`, or figma MCP which consistently fails), OpenCode may block indefinitely.

### Tertiary: Environment Variable Gaps

| Variable | Status | Impact |
|---|---|---|
| `DB_PATH` | NOT SET | saga MCP cannot initialize (references `{env:DB_PATH}`) |
| `WAKATIME_API_KEY` | NOT SET | opencode-wakatime plugin will start but not track |

### Startup Timing

From log analysis (latest run `08a9502e`):
- `creating instance` → `bootstrapping`: ~0.5s
- `bootstrapping` → `init count=29`: ~29s
- Total cold start: ~30s

This is consistent across all runs. The hang scenario described by the user would manifest as a startup that never reaches `init count=29`.

---

## B. Risk Assessment

| Risk | Severity | Likelihood | Impact |
|---|---|---|---|
| 17 uninstalled plugins cause npm resolution hang | **HIGH** | Likely (intermittent, network-dependent) | OpenCode hangs at startup indefinitely |
| MCP server startup hang (no timeout) | **HIGH** | Moderate (figma always fails, saga has missing env) | Cold start hangs waiting for MCP child process |
| Hardcoded API key in auth.json | **CRITICAL** | Confirmed | Key `sk-J27PV...` exposed in `/home/node/.local/share/opencode/auth.json` |
| `DB_PATH` missing for saga MCP | **MEDIUM** | Certain | saga MCP fails to start or starts with undefined behavior |
| `WAKATIME_API_KEY` missing | **LOW** | Certain | wakatime plugin non-functional |
| 19 MCP servers (14 local + 5 remote) | **MEDIUM** | Certain | Heavy cold-start overhead, 24 subprocesses launched |
| 61MB SQLite DB + WAL | **LOW** | Possible under concurrent access | WAL checkpoint contention |
| Duplicate config files (global = project) | **LOW** | Confirmed | Maintenance burden, no functional issue today |

### Security Finding

`/home/node/.local/share/opencode/auth.json` contains a hardcoded `opencode-go` API key. This provider is not defined in the config file but exists in auth state from prior sessions. The key `sk-J27PV...` should be rotated immediately.

---

## C. Inventory

### Providers (1)

| Provider | API Endpoint | Models |
|---|---|---|
| deepseek | `https://api.deepseek.com/v1` | deepseek-v4-pro, deepseek-v4-flash |

### Models (2)

| Model | Role | Context | Output Limit | Reasoning |
|---|---|---|---|---|
| deepseek-v4-pro | primary + small | 1,048,576 | 393,216 | Yes |
| deepseek-v4-flash | — | 1,048,576 | 393,216 | Yes |

### Plugins (17 declared, 0 installed)

| Plugin | Installed | Notes |
|---|---|---|
| opencode-websearch-cited | No | |
| @morphllm/opencode-morph-plugin | No | |
| @nick-vi/opencode-type-inject | No | |
| opencode-supermemory | No | |
| @tarquinen/opencode-dcp | No | |
| @f97/opencode-morph-fast-apply | No | |
| opencode-helicone-session | No | |
| opencode-goal-plugin | No | |
| opencode-sentry-monitor | No | |
| opencode-vibeguard | No | |
| opencode-background-agents | No | |
| @franlol/opencode-md-table-formatter | No | |
| @zenobius/opencode-skillful | No | |
| opencode-conductor | No | |
| micode | No | |
| @mohak34/opencode-notifier | No | |
| opencode-wakatime | No | Requires WAKATIME_API_KEY (not set) |

### Skills (30)

All skills present and accounted for in `/workspaces/codespace-workbench/.opencode/skills/`.

---

## D. Recommendations

### Immediate (Fix the hang)

1. **Remove all 17 uninstalled plugins from the config** or install them with `npm install` in `~/.config/opencode/`. This is the most likely fix for the intermittent hang.

2. **Add `timeout` to all local MCP servers.** Without timeouts, any child process that hangs during initialization will block startup indefinitely.

3. **Set `DB_PATH` environment variable** or remove saga MCP if not needed.

### Short-term

4. **Rotate the hardcoded API key** in `auth.json` and remove the stored key. Use env vars instead.

5. **Audit which MCP servers are actually needed.** 19 MCP servers is aggressive. Each adds ~1-2s to cold start. Consider disabling unused ones.

6. **Add `BROWSERLESS_HOST`, `BROWSERLESS_PORT`, `BROWSERLESS_TOKEN`, `BROWSERLESS_PROTOCOL`** env vars if the browserless MCP is to connect to the Docker container on localhost:3000.

### Long-term

7. Pin plugin versions to avoid drift between config and installed packages.
8. Set up a health check script to validate plugin + MCP readiness.
9. Monitor `init count` — if it's less than 29, an MCP server or plugin failed to load.

---

## E. Safe Cleanup Plan

### Step 1: Remove uninstalled plugins from config

Remove the `plugin` array entries that are not installed. Keep only `@opencode-ai/plugin` which is the only installed package.

### Step 2: Add timeouts to MCP servers

Add `"timeout": 30000` (30s) to all local MCP servers that don't have one.

### Step 3: Fix saga MCP

Either set `DB_PATH` env var, or disable the saga MCP server (set `"enabled": false`).

### Step 4: Remove hardcoded API key

Delete `/home/node/.local/share/opencode/auth.json` and let it regenerate, or remove the `opencode-go` entry.

### Step 5: Verify

Run `opencode` (not `--pure`) and confirm it starts without hanging.
