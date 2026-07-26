# Git Configuration

> Purpose: Git configuration, hooks, and workflow settings for the workstation.

## Global Git Config

Git configuration is managed via the codespace's default settings. Additional customizations:

- User identity set via `GIT_COMMITTER_NAME` and `GIT_COMMITTER_EMAIL` (codespace-injected)
- GitHub CLI (`gh`) authenticated via `GITHUB_TOKEN` (codespace-injected)

## Repository Settings

- Remote: `https://github.com/simonplmak-cloud/codespace-workbench`
- Default branch: `main`
- Push policy: Manual only (no auto-push)

## Pre-Commit Checks

Before committing:
1. Run `bash scripts/security/scan-secrets.sh`
2. Verify runtime config is synced: `bash scripts/maintenance/sync-runtime-config.sh`
3. Review `git diff --stat`
