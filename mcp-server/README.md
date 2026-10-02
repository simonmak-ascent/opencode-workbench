# opencode-workbench

An MCP server **and connector** that clones the [OpenCode](../../README.md) workbench
installation onto Linux machines — the machine it runs on (`local`) or a remote host
over SSH (`ssh`). It reproduces the same settings: the profile `opencode.json`
(rendered for the target's paths), agent skills, plugins, MCP servers, and optional
Docker/tooling.

## Quick start

Register it with OpenCode (or any MCP client):

```json
{
  "mcp": {
    "workbench": {
      "type": "local",
      "command": ["npx", "-y", "@simonmak-ascent/opencode-workbench"],
      "enabled": true,
      "timeout": 600000
    }
  }
}
```

Or point at the hosted server: `https://opencode-workbench.simonmak.com/mcp` (Streamable HTTP).
From a checkout, use the local build instead:

```json
{ "command": ["node", "/path/to/workbench/mcp-server/dist/index.js"] }
```

## Tools

| Tool | Purpose |
|------|---------|
| `workbench_info` | Repo, components by tier, optional MCP add-ons. |
| `inspect_target` | OS/arch/pkg-manager/Node/Docker/OpenCode/home/npm paths. |
| `plan_clone` | Diff the target against the profile → steps to install / present / manual. |
| `apply_clone` | Clone the profile + install missing components + write rendered config. Idempotent. |
| `install_component` | Install a single component by id. |
| `verify_clone` | Re-check config, env template, and every component. |
| `bootstrap_host` | One-call provisioning: kernel-up platform scan + dry-run upgrade plan, latest-stable OpenCode + version pin, apply, verify; `help:true` documents parameters without touching the target. |
| `list_required_credentials` | Value-blind: which credentials are missing and how to acquire each. |
| `run_auth_flow` | Emit-and-verify acquisition guidance for one credential. |

Every tool takes a `target`:

```json
{ "target": { "mode": "ssh", "host": "<your-box>", "user": "<your-user>", "identityFile": "~/.ssh/id_ed25519" } }
```

`apply_clone` options: `components[]`, `workspace`, `profileUrl`, `skipRepo`, `dryRun`.

## Components

- **required** — `git`, `curl`, `node` (>=20), `opencode`
- **core** — `pnpm`, `uv`, `gh`, `npm-mcps`, `vendored-mcps`, `research-mcps`, `skills`, `plugins`, `playwright-browsers`
- **optional** — `github-mcp`, `docker`, `docker-containers`, `data-tools`, `scientific`, `db-clients`

Add-ons (esg-hub, humanity4ai, saga, surrealdb, google-workspace, google-search,
ms-365, stripe, alibaba-cloud-ops, designlang, difflens) are omitted from the rendered
config unless you pass `enabledMcp`/run with the full profile.

## Security

The connector **never reads, transmits, or writes secret values**. It writes an empty
`~/.env.workbench` template (mode `600`) listing the `{env:VAR}` names the rendered
config references. Fill them on the target.

## Development

```bash
pnpm install     # runs prepare -> tsc build
pnpm typecheck
pnpm test
pnpm build
```

Builds/tests run in CI (`.github/workflows/mcp-server.yml`) and on a compute box
(`cs run "pnpm test"`) — never on the local workstation.
