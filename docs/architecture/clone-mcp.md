# Workbench Clone MCP (`opencode-workbench`)

> Repositions this repository from a single workstation's configuration into a
> distributable **MCP server + connector** that clones that configuration onto
> other Linux machines.

## Purpose

The repository is the source of truth for the workbench profile. `opencode-workbench`
turns that profile into an installable capability: an agent can inspect a target
Linux machine, plan the delta against the profile, apply the delta, and verify the
result — locally or over SSH.

## Distribution

- Public repo: `https://github.com/simonplmak-cloud/opencode-workbench`
- Entry point: `node mcp-server/dist/index.js` (bin: `opencode-workbench`)
- Run without installing: `npx -y github:simonplmak-cloud/opencode-workbench`
- Registration snippet and connector manifest: [`connector.json`](../../connector.json)

## Architecture

```
mcp-server/src/
  index.ts       stdio entry (McpServer + StdioServerTransport)
  tools.ts       MCP tool registration (zod input schemas)
  clone.ts       orchestration: inspect / plan / apply / verify
  components.ts  portable profile (required | core | optional) + install scripts
  render.ts      renders opencode.json for a target HOME/workspace/npm prefix
  probe.ts       dependency-free target inspection script
  profile.ts     profile + connector loading, env-template rendering
  target.ts      local + SSH transports over the system ssh binary
```

### Connector model

| Mode | How it reaches the target |
|------|---------------------------|
| `local` | `bash -s` on the machine hosting the MCP server |
| `ssh` | `ssh [-p …] [-i …] user@host -- bash -s` (uses `~/.ssh/config`, agent, keys) |

Scripts are streamed to `bash -s` over stdin, so there is no shell-quoting layer
between the agent and the target.

### Path rendering

The committed `opencode.json` hardcodes the original workstation's paths. The
renderer rewrites them per target:

| From | To |
|------|----|
| `/home/node` | target `$HOME` |
| `/home/node/.npm-global/lib/node_modules` | detected npm-global modules dir |
| `/workspaces/workbench` | target workspace dir |
| `./plugins/` | `<configDir>/plugins/` |

MCP servers listed as opt-in add-ons are dropped unless `enabledMcp: "all"`.

## Security posture

- No secret values are read, transmitted, or written; only a names-only
  `~/.env.workbench` template (mode `600`).
- The repo is public and gated by gitleaks (`.github/workflows/secret-scan.yml`),
  GitHub secret scanning, and push protection.
- SSH uses the operator's existing keys/agent; no credentials are stored.

## Verification

Unit tests cover path rendering, MCP filtering and env extraction
(`mcp-server/test/`). CI builds and tests the package. End-to-end validation
(clone into a throwaway Linux container and a reachable SSH host) runs on a
compute box via `cs run`.
