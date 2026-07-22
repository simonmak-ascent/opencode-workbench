# Codespace Workbench

A cloud dev environment for OpenCode with the full MCP stack — no local disk
or compute needed. Pair it with the OpenCode desktop app (attach via URL) or
use the TUI directly in the Codespace terminal.

## One-time setup

1. **Create the Codespace** (web: repo → Code → Codespaces → +, or CLI):

   ```bash
   gh codespace create --repo simonplmak-cloud/codespace-workbench --machine basicLinux32gb
   ```

   Recommended machine: 4-core (`basicLinux32gb`) — fits the GitHub Pro
   180 core-hour / 20 GB monthly quota (~45 h of active use). The Codespace
   auto-stops after 30 min idle; state is preserved.

2. **Wait for postCreate** (~3-5 min first time — installs opencode, MCP
   servers, playwright chromium, starts Postgres + Browserless containers,
   builds esg-hub). Check progress: repo → Codespaces → ⋯ → View logs, or
   `gh codespace logs`.

3. **Secrets** — two ways (the bootstrap script already did option b):

   a. **Permanent**: Settings → Codespaces → Secrets → new secret, grant
      access to this repo. Requires nothing else; injected as env vars into
      every Codespace process.
   b. **Bootstrap (done for you)**: values were written to
      `~/.env.workbench` inside the Codespace, which `~/.bashrc` and
      `setup.sh` source automatically.

   | Secret | Used by |
   |---|---|
   | `SIMONPLMAK_CLOUD_PAT` | github MCP |
   | `PERPLEXITY_API_KEY` | perplexity MCP |
   | `BRAVE_API_KEY` | brave-search MCP |
   | `BROWSERLESS_TOKEN` | browserless MCP + container |
   | `KIMI_API_KEY` | LLM (Kimi K3) |
   | `SURREAL_ENDPOINT` / `SURREAL_USERNAME` / `SURREAL_PASSWORD` / `SURREAL_NAMESPACE` / `SURREAL_DATABASE` | esg-hub MCP |

## Daily use

**Attach the desktop app (option 2):**

```bash
# inside the Codespace
opencode serve --port 4096 --hostname 0.0.0.0
```

Then in the desktop app: Settings → Server →
`https://<codespace-name>-4096.app.github.dev`
(set port 4096 visibility to Public in the Ports panel if the app can't
authenticate through GitHub).

**Or just use the TUI in the Codespace terminal:**

```bash
opencode
```

**Work on other repos** — `gh` is pre-authenticated inside Codespaces:

```bash
gh repo clone simonplmak-cloud/esg-hub
cd esg-hub && opencode
```

The global `~/.config/opencode/opencode.json` (installed by setup) applies
everywhere in the Codespace; project-level configs still override.

## What's inside

- opencode CLI (Kimi K3 default model)
- MCPs: github, perplexity (Agent API wrapper), brave-search, postgres
  (memory), browserless, playwright, esg-hub, humanity4ai + remote
  context7 / gh_grep / n8n / clerk / vercel
- Postgres 16 (Docker, db `memory`) + Browserless chromium (Docker)
- `vendor/` — vendored custom MCPs (perplexity-agent-mcp, browserless-mcp),
  installed to `~/.local/bin` by setup.sh

## Costs

- Codespaces: metered against your 180 core-h/20 GB Pro quota — stop or
  delete when done (`gh codespace stop`, `gh codespace delete`).
- Everything else (LLM, API calls) bills to the respective providers as usual.
