# Registry listing runbook

> Goal: make `opencode-workbench` discoverable in the five free MCP registries
> (Vision I-007 / spec `mcp-quality-and-registry`). Never commit API keys.

Status as of 2026-10-03:

| Registry | Mechanism | Status | Credential |
|----------|-----------|--------|------------|
| Official MCP Registry | `server.json` + `mcp-publisher` | manifest ready | GitHub OIDC |
| Glama | crawler + claim file | **live** (`/.well-known/glama.json`) | claim token |
| Smithery | `@smithery/cli publish` / API | prepared | `SMITHERY_API_KEY` |
| PulseMCP | submission form / API | prepared | account |
| mcp.so | auto-crawl GitHub + claim | prepared | claim (optional) |

## 0. Prerequisites

```bash
# build + TDQS lint baseline (free, deterministic)
npx mcp-tdqs lint --command 'node mcp-server/dist/index.js' --server-name opencode-workbench --fail-on error
```

## 1. Official MCP Registry (canonical — do this first)

```bash
# prebuilt binary
curl -L "https://github.com/modelcontextprotocol/registry/releases/latest/download/mcp-publisher_$(uname -s | tr '[:upper:]' '[:lower:]')_$(uname -m | sed 's/x86_64/amd64/;s/aarch64/arm64/').tar.gz" \
  | tar xz mcp-publisher && sudo mv mcp-publisher /usr/local/bin/

mcp-publisher login github-oidc   # GitHub OIDC (non-interactive; required in CI)
mcp-publisher publish             # reads ./server.json
```

Verify: `curl -s "https://registry.modelcontextprotocol.io/v0/servers?search=opencode-workbench"`.

> The `name` in `server.json` (`io.github.simonmak-ascent/opencode-workbench`) is
> namespaced to the GitHub org that owns the repo; `login github` asserts that.

## 2. Glama

Already indexed (Dockerfile + `api/glama.js` + `glama.json`). The live claim file:

```
https://opencode-workbench.simonmak.com/.well-known/glama.json
```

Claim the listing on glama.ai to unlock scores/analytics. Glama re-publishes the
official registry, so it will also pick up §1 automatically.

## 3. Smithery

Needs an API key (user-held). Once `SMITHERY_API_KEY` is in the environment:

```bash
npx -y @smithery/cli@latest publish --name opencode-workbench
# or via the registry API using SMITHERY_API_KEY
```

Store the key in `~/.env.workbench` (never commit it).

## 4. PulseMCP

Editorial/curated submission — submit the official-registry name
(`io.github.simonmak-ascent/opencode-workbench`) and repo URL through the PulseMCP
site; no API key needed beyond an account.

## 5. mcp.so

Auto-crawls public GitHub servers. Claim the generated listing (GitHub sign-in) to
add the install command and remote URL.

## Drift guard

`server.json` `version` and package `identifier`/`version` must match
`package.json`. Keep them in lockstep on every release (bump + tag `vX.Y.Z`).

## What the agent can automate vs not

- **Automated:** build, TDQS lint, `server.json` creation, Glama claim file, this runbook.
- **Credential/user:** TDQS full score (AC-3), Smithery publish (AC-6), PulseMCP submission (AC-7).
