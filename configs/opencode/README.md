# OpenCode Configuration

The canonical OpenCode configuration lives at the repository root as `opencode.json`.

## Restoration

During `postCreateCommand`, `.devcontainer/setup.sh` copies it to:

```
~/.config/opencode/opencode.json
```

## Configuration Details

```jsonc
{
  "$schema": "https://opencode.ai/config.json",
  "model": "kimi-for-coding/k3",
  "lsp": true,
  "mcp": { /* 22 MCP server definitions, see configs/mcp/ */ }
}
```

## Current State (2026-07-26)

- **Model:** kimi-for-coding/k3
- **LSP:** Enabled
- **MCP active servers:** 19 of 22 (3 disabled)
- **Remote servers auth:** n8n (OAuth), vercel (OAuth) — completed
- **Custom instructions:** None configured

## Custom Instructions

OpenCode supports custom instructions via `AGENTS.md` or `.opencode/AGENTS.md` files.
Create `AGENTS.md` at the repo root to add project-specific instructions.

## Settings File

```
~/.config/opencode/opencode.json
```

This file is the runtime copy of the repo's `opencode.json`, copied by setup.sh.
Changes to the repo file take effect after the next setup.sh run.

## Server

Start the OpenCode server for remote/desktop app attachment:

```bash
opencode serve --port 4096 --hostname 0.0.0.0
```

## MCP Auth

Authenticate remote MCP servers:

```bash
opencode mcp auth <server-name>
```

Supported: n8n, vercel (OAuth-based remote servers)
