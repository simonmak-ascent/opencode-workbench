# Home Directory Audit

> Generated: 2026-07-26 | ~ = /home/node
> Classifies all files affecting development behaviour.

## File Classification

### Source Control Candidates
Files already in or should be in the repository:

| File | Purpose | Action |
|------|---------|--------|
| ~/.npmrc | npm global prefix config | **Gap** — should be in setup.sh |
| ~/.bashrc | Bash config (PATH additions) | **Gap** — customizations should be in aliases.sh |
| .devcontainer/setup.sh | Already in repo | No action needed |
| .devcontainer/aliases.sh | Already in repo | No action needed |
| opencode.json → ~/.config/opencode/ | Copied by setup.sh | No action needed |

### Secrets (NEVER commit)

| File | Contents | Risk |
|------|----------|------|
| ~/.env.workbench | API keys, tokens, DB URLs | HIGH — 10+ secrets |
| ~/.docker/config.json | Docker registry auth tokens | HIGH — encoded credentials |
| ~/.local/share/opencode/mcp-auth.json | MCP OAuth tokens (vercel) | HIGH — OAuth credentials |
| ~/.ssh/authorized_keys | SSH public keys | LOW — public keys only |
| ~/.opencode/ | OpenCode runtime (DB, logs, snapshots) | MEDIUM — may contain conversation data |

### Runtime Cache (gitignored / not needed)

| File/Dir | Contents |
|----------|----------|
| ~/.cache/ | Application caches (opencode models.json) |
| ~/.npm/ | npm cache |
| ~/.npm-global/ | npm global packages (reproducible via setup.sh) |
| ~/.opencode/ | OpenCode runtime (DB, logs, snapshots) |
| ~/.vscode-remote/ | VS Code server binaries |
| ~/.oh-my-zsh/ | Shell framework |
| ~/.surrealdb/ | SurrealDB binary (140 MB, downloaded on-demand) |
| ~/.playwright-mcp/ | Playwright session recordings |

### Local Only (manual setup, not reproducible)

| File | Purpose | Reproducible? |
|------|---------|---------------|
| ~/.bash_history | Shell history | No (runtime) |
| ~/.bash_logout | Bash logout | Yes (standard Debian) |
| ~/.bashrc | Bash config | Partially (sources .env.workbench, PATH) |
| ~/.profile | Login profile | Yes (standard) |
| ~/.zshrc | Zsh config | Yes (Oh My Zsh, standard) |
| ~/.zprofile | Zsh login | Yes (sources .profile) |
| ~/.config/opencode/opencode.json | OpenCode config | Yes (copied from repo by setup.sh) |

## Recommendations

1. **~/.npmrc**: Move `npm config set prefix` to `.devcontainer/setup.sh`
2. **~/.bashrc PATH entries**: Move `export PATH="$HOME/.opencode/bin:$PATH"` to `.devcontainer/aliases.sh`
3. **~/.env.workbench**: All vars documented in `docs/environment-inventory.md` and `docs/SWAS-secrets.md`
4. **~/.docker/config.json**: Never commit; Docker credential helpers recommended
5. **~/.ssh/**: Never commit; SSH is handled by SWAS automatically
6. **~/.surrealdb/**: Already gitignorable; downloaded on-demand by setup.sh
7. **~/.local/share/opencode/**: Runtime data; exclude from backups
