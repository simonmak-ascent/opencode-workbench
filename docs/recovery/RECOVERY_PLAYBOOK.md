# Recovery Playbook

> Purpose: Step-by-step instructions for recovering this workstation from scratch.
> Target audience: Anyone who needs to rebuild after a disaster.

## Prerequisites

1. Access to `https://github.com/simonplmak-cloud/codespace-workbench`
2. All required GitHub Codespaces Secrets configured (see `docs/architecture/codespaces-secrets.md`)
3. GitHub account with Codespaces access

## Phase 1: Create New Codespace

1. Navigate to `https://github.com/simonplmak-cloud/codespace-workbench`
2. Click **Code** → **Codespaces** → **Create codespace on main**
3. Wait for the codespace to initialize (~3-5 minutes)
4. The `postCreateCommand` will run `bash .devcontainer/setup.sh` automatically

## Phase 2: Verify Infrastructure

```bash
# Verify Docker containers
docker ps
# Expected: pg-memory (postgres:16-alpine), browserless (ghcr.io/browserless/chromium)

# Verify MCP packages
npm list -g --depth=0
# Expected: 11 packages (brave-search, postgres, playwright, shadcn-ui, echarts,
#   mermaid, saga, swagger-testcase, design-system, figma, sentry)

# Verify OpenCode binary
which opencode
# Expected: /home/node/.opencode/bin/opencode
opencode --version
```

## Phase 3: Verify Environment

```bash
# Check critical secrets are present
env | grep -E '^(DEEPSEEK_|SIMONPLMAK_|PERPLEXITY_|BRAVE_|BROWSERLESS_|FIGMA_|SENTRY_|N8N_)'

# Check non-secret config vars
env | grep -E '^(DATABASE_URL|DB_PATH|BROWSERLESS_HOST|BROWSERLESS_PORT|BROWSERLESS_PROTOCOL)'
```

## Phase 4: Install Browser Dependencies

```bash
npx playwright install chrome
```

## Phase 5: Start OpenCode

```bash
cd /workspaces/codespace-workbench
opencode
```

## Phase 6: Authenticate Remote MCPs

```bash
# Vercel OAuth (requires browser interaction)
opencode mcp auth vercel
```

## Phase 7: Verify MCP Servers

In OpenCode, check that all expected MCP tools are available:
- context7 (remote)
- gh_grep (remote)
- n8n (remote)
- clerk (remote)
- github (local)
- brave-search (local)
- postgres (local)
- browserless (local)
- playwright (local)
- figma (local)
- mermaid (local)
- saga (local)
- echarts (local)
- shadcn (local)
- swagger-testcase (local)
- design-system (local)
- sentry (local)

## Phase 8: Verify Skills

In OpenCode, the 28 custom agent skills should appear in the available skills list:
- 10 research skills
- 10 development skills
- 8 publishing skills

## Phase 9: Bootstrap Additional Tools (Optional)

```bash
bash scripts/bootstrap-tools.sh
```

## Recovery Verification Checklist

- [ ] Docker containers running (pg-memory, browserless)
- [ ] npm global packages installed
- [ ] OpenCode binary present
- [ ] All secrets present in environment
- [ ] OpenCode server starts
- [ ] All MCP servers connect
- [ ] 28 skills available
- [ ] Playwright chromium installed
- [ ] Vercel OAuth completed (optional)

## Troubleshooting

| Symptom | Action |
|---------|--------|
| Docker not running | `docker ps` — if empty, run `.devcontainer/setup.sh` manually |
| Missing npm packages | `npm install -g` each missing package (see `docs/architecture/mcp-inventory.md`) |
| OpenCode not found | `curl -fsSL https://opencode.ai/install | bash` |
| MCP -32000 errors | Check env var names in `opencode.json` match what the server expects |
| Perplexity 401 | Generate new key at https://perplexity.ai/settings/api |

## Time Estimate

- Full recovery: ~10 minutes (mostly automated)
- Manual steps: ~2 minutes (playwright install, vercel auth)
