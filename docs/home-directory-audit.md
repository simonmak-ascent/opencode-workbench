# Home Directory Audit

> Generated: 2026-07-26 | ~ = /home/node

## File Classification

### Source Control Candidates
Files that should be versioned in the repository:

| File | Purpose | Action |
|------|---------|--------|
| ~/.npmrc | npm global prefix config | Add to repo as configs/shell/.npmrc |
| ~/.gitignore | Global gitignore patterns | Already covered by repo .gitignore |
| .devcontainer/setup.sh | Already in repo | No action needed |

### Secrets (NEVER commit)

| File | Contents | Risk |
|------|----------|------|
| ~/.env.workbench | API keys, tokens, DB URLs | HIGH — contains 10+ secrets |
| ~/.docker/config.json | Docker registry auth tokens | HIGH — 3 encoded credentials |
| ~/.ssh/authorized_keys | SSH public keys | LOW — public keys, not secrets |

### Runtime Cache (ignore)

| File/Dir | Contents |
|----------|----------|
| ~/.cache/ | Application caches |
| ~/.npm/ | npm cache |
| ~/.opencode/ | OpenCode runtime (DB, logs, snapshots) |
| ~/.vscode-remote/ | VS Code server binaries |
| ~/.oh-my-zsh/ | Shell framework |
| ~/.surrealdb/ | SurrealDB binary (140 MB) |
| ~/.playwright-mcp/ | Playwright session recordings |

### Local Only (manual setup)

| File | Purpose | Reproducible? |
|------|---------|---------------|
| ~/.bash_history | Shell history | No (runtime) |
| ~/.bash_logout | Bash logout | Yes (standard Debian) |
| ~/.bashrc | Bash config | Partially (sources .env.workbench) |
| ~/.profile | Login profile | Yes (standard) |
| ~/.zshrc | Zsh config | Yes (Oh My Zsh, standard) |
| ~/.zprofile | Zsh login | Yes (sources .profile) |
| ~/.config/opencode/opencode.json | OpenCode config | Yes (copied from repo) |

## Recommendations

1. **~/.npmrc**: Move content to devcontainer.json or setup.sh
2. **~/.bashrc customizations**: Extract to a script in the repo
3. **~/.env.workbench**: Already sourced at runtime; ensure all vars documented in README
4. **~/.docker/config.json**: Never commit; consider using Docker credential helpers
5. **~/.ssh/**: Never commit; SSH access is handled by Codespaces automatically
6. **~/.surrealdb/**: Add to .gitignore if not already; downloaded on-demand
