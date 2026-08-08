# MCP Server Inventory

**Generated:** 2026-07-27
**Total MCP Servers:** 19 (5 remote, 14 local)
**All Enabled:** Yes

---

## Remote MCP Servers (5)

| # | Name | URL | Connectivity | Auth Status | Notes |
|---|---|---|---|---|---|
| 1 | `context7` | `https://mcp.context7.com/mcp` | 405 | Public | Method Not Allowed over GET (expected for MCP) |
| 2 | `gh_grep` | `https://mcp.grep.app` | 405 | Public | Method Not Allowed over GET (expected for MCP) |
| 3 | `n8n` | `https://simonmak.app.n8n.cloud/mcp-server/http` | 401 | Bearer token | Uses `N8N_MCP_ACCESS_TOKEN` (set) |
| 4 | `clerk` | `https://mcp.clerk.com/mcp` | 406 | Public | Not Acceptable over GET (expected for MCP) |
| 5 | `vercel` | `https://mcp.vercel.com` | 401 | OAuth | **Status: needs_auth** — OAuth flow incomplete or expired |

### Remote MCP Health

- `vercel`: **WARNING** — consistently shows `needs_auth` on every startup. OAuth tokens in `mcp-auth.json` may be expired.
- Others: Reachable; HTTP status codes are expected (MCP servers require SSE/Streamable HTTP, not plain GET).

---

## Local MCP Servers (14)

| # | Name | Entry Point | Exists | Timeout | Env Vars Required | Status |
|---|---|---|---|---|---|---|
| 1 | `github` | `/home/node/.local/bin/github-mcp-server stdio` | Yes | None | `GITHUB_PERSONAL_ACCESS_TOKEN` (set) | OK |
| 2 | `perplexity` | `node .../perplexity-agent-mcp/index.js` | Yes | 600000ms | `PERPLEXITY_API_KEY` (set) | OK |
| 3 | `brave-search` | `node .../server-brave-search/dist/index.js` | Yes | 120000ms | `BRAVE_API_KEY` (set) | OK |
| 4 | `postgres` | `node .../server-postgres/dist/index.js {DATABASE_URL}` | Yes | None | `DATABASE_URL` passed as arg (set) | OK |
| 5 | `browserless` | `node .../browserless-mcp/dist/index.js` | Yes | None | `BROWSERLESS_*` (all set) | OK |
| 6 | `playwright` | `node .../@playwright/mcp/cli.js` | Yes | None | None | OK |
| 7 | `figma` | `node .../figma-developer-mcp/dist/index.js` | Yes | None | `FIGMA_API_KEY` (set) | **WARNING: always fails** |
| 8 | `mermaid` | `node .../mcp-mermaid/build/index.js` | Yes | None | None | OK |
| 9 | `saga` | `node .../saga-mcp/dist/index.js` | Yes | None | `DB_PATH` (**NOT SET**) | **WARNING: missing env** |
| 10 | `echarts` | `node .../mcp-echarts/build/index.js` | Yes | None | None | OK |
| 11 | `shadcn` | `node .../@jpisnice/shadcn-ui-mcp-server/build/index.js` | Yes | None | `GITHUB_TOKEN` (set) | OK |
| 12 | `swagger-testcase` | `node .../swagger-testcase-mcp/dist/index.js` | Yes | None | None | OK |
| 13 | `design-system` | `node .../mcp-design-system-extractor/dist/index.js` | Yes | None | None | OK |
| 14 | `sentry` | `node .../@sentry/mcp-server/dist/index.js` | Yes | None | `SENTRY_AUTH_TOKEN` (set) | OK |

### Local MCP Health Issues

**figma (CRITICAL):**
- Consistently fails on **every** startup across all runs in the logs
- Status: `failed`
- The entry point exists, `FIGMA_TOKEN` is set
- Possible causes: invalid token, network restrictions, or upstream API issues

**saga (WARNING):**
- `DB_PATH` environment variable is **not set**
- Config line: `"DB_PATH": "{env:DB_PATH}"`
- The saga MCP may fail to start or start with undefined database path

**No timeout configured for 12/14 local MCPs:**
- Only `perplexity` (600s) and `brave-search` (120s) have explicit timeouts
- If any of the other 12 child processes hang during init, OpenCode startup blocks indefinitely

---

## MCP Startup Behavior

From the log, the startup sequence per run:

1. Config loading (~0.5s)
2. Bootstrap + MCP initialization (~7-8s)
3. `vercel` warning logged (~10s in)
4. `figma` failure logged (~16s in)
5. `init count=29` (~29s in) — startup complete

The `init count=29` likely represents 19 MCP servers + 10 other initializations (LSP, watcher, snapshot, etc.). If this count is lower than 29, something failed to initialize.

---

## MCP Timeout Coverage

| Server | Timeout | Risk |
|---|---|---|
| perplexity | 600s | Safe |
| brave-search | 120s | Safe |
| github | **None** | Could hang |
| postgres | **None** | Could hang |
| browserless | **None** | Could hang |
| playwright | **None** | Could hang |
| figma | **None** | Already failing |
| mermaid | **None** | Low risk (stateless) |
| saga | **None** | Missing env, likely hang |
| echarts | **None** | Low risk (stateless) |
| shadcn | **None** | Could hang |
| swagger-testcase | **None** | Low risk |
| design-system | **None** | Low risk |
| sentry | **None** | Low risk |

---

## Recommendations

1. **Add `"timeout": 30000`** to all local MCP servers without one
2. **Disable `figma`** (set `"enabled": false`) until the auth issue is resolved
3. **Set `DB_PATH`** for saga, or disable saga if not needed
4. **Fix `vercel` OAuth** — re-authenticate or disable if unused
5. **Consider reducing MCP count** — 19 servers is aggressive; each adds cold start overhead
