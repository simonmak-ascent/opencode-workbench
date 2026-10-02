# Workstation Playbook

> Purpose: Capture operational knowledge that normally exists only in memory
> Target: Anyone recovering or maintaining this workstation

## Daily Operations

### Starting OpenCode
```bash
cd /workspaces/workbench
opencode
```

### Running the OpenCode Server
```bash
opencode serve --port 4096 --hostname 0.0.0.0
```

### Authenticating Remote MCPs
```bash
# Vercel (requires browser OAuth)
opencode mcp auth vercel

```

### Checking MCP Status
- OpenCode lists connected MCP tools in its system prompt
- Run `opencode` and check available tools in the TUI
- Or test individual MCP servers via their tools

### Updating the Workstation

1. **Pull latest repo**: `git pull origin main`
2. **Re-run setup**: `bash .devcontainer/setup.sh`
3. **Sync config**: `cp opencode.json ~/.config/opencode/opencode.json`
4. **Restart OpenCode** to pick up config changes

### Adding a New MCP Server

1. Install the package: `npm install -g <package>`
2. Add to `opencode.json` under `mcp` with proper config
3. If it needs secrets, add env var to `devcontainer.json` `remoteEnv`
4. Update `docs/mcp-inventory.md` and `docs/software-inventory.md`
5. Update `docs/SWAS-secrets.md` if new secret needed
6. Commit all changes

### Adding a New Skill

1. Create `.opencode/skills/<name>/SKILL.md` with YAML frontmatter
2. Include: `name`, `description`, `license`, `compatibility`, `metadata`
3. Follow naming: lowercase alphanumeric with hyphens
4. Restart OpenCode to load

### Troubleshooting

| Symptom | Check |
|---------|-------|
| MCP -32000 error | Check env var name matches what the server expects. Compare `opencode.json` env mapping with server source code |
| Perplexity 401 | Regenerate API key at https://perplexity.ai/settings/api — must start with `pplx-` |
| Playwright error | Run `npx playwright install chrome` |
| Browserless timeout | Check Docker container: `docker ps \| grep browserless` |
| Saga needs DB_PATH | Ensure `DB_PATH` is set in devcontainer.json and opencode.json |
| Design-system CORS | Needs `STORYBOOK_URL` env pointing to a live Storybook instance |
| Postgres connection | Verify Docker container: `docker ps \| grep pg-memory` |

### Before SWAS Rebuild

1. Commit and push all changes
2. Verify `devcontainer.json` has all needed `remoteEnv` entries
3. Verify all SWAS secrets exist in GitHub
4. Run through the recovery checklist in `docs/recovery-gap-analysis.md`

### After SWAS Rebuild

1. Wait for `postCreateCommand` (setup.sh) to complete
2. Verify Docker containers: `docker ps`
3. Verify MCP packages: `npm list -g --depth=0`
4. Test OpenCode: `opencode` and check available tools
5. Run the bootstrap script if needed: `bash scripts/bootstrap-tools.sh`
