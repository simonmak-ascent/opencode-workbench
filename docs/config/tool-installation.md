# Tool Installation

> Phase: #2 | Created: 2026-07-27
> Reproducible installation instructions for every tool in the workflow.

## Bootstrap Sources

| Source | Script | What it installs |
|--------|--------|-----------------|
| Post-create | `.devcontainer/setup.sh` | opencode CLI, npm MCPs, Docker containers, GitHub MCP binary, vendored MCPs, external repos |
| Optional bootstrap | `scripts/bootstrap-tools.sh` | Data tools (pandoc, miller, jq, csvkit, duckdb, polars, etc.), vercel CLI, surreal CLI |
| Figma server | `scripts/services/figma-mcp.sh start` | Figma MCP HTTP server on port 3333 |

## Manual Post-Setup

```bash
# Playwright Chromium
npx playwright install chrome

# Vercel OAuth
opencode mcp auth vercel
```

## Proposed Phase #3 Tools

```bash
npm install -D vitest zod cheerio
npm install opossum p-limit pino
```

## Tool Versions

See `scripts/bootstrap-tools.sh` for version-agnostic installs. Pinned versions for Phase #3 tools TBD during implementation.
