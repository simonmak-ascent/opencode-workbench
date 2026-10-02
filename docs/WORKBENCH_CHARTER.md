# Workbench Charter

> Version: 1.0.0 | Ratified: 2026-07-26
> This charter defines the purpose, principles, and governance of the SWAS Workbench Operating System.

## Mission

To provide a fully reproducible, self-documenting, and recoverable development workstation that operates as the permanent source of truth for all configuration, automation, and operational knowledge.

## Goals

1. **Reproducibility**: A new SWAS can be rebuilt from repository contents alone (plus the SWAS box Secrets) with minimal manual effort.
2. **Self-Documentation**: Every configuration, tool, and workflow is documented within the repository. No critical knowledge exists only in human memory.
3. **Recoverability**: Complete disaster recovery is possible. A deleted SWAS can be fully restored.
4. **Security**: Secrets are never stored in the repository. All sensitive values flow through the SWAS box Secrets.
5. **Maintainability**: The system is structured for clarity. Changes are tracked. Drift between declaration and runtime is detectable.
6. **Automation**: Repetitive tasks (inventory, backup, audit) are scripted. Manual steps are documented and minimized.

## Principles

### Source of Truth
The repository is the single source of truth. Runtime configuration must match repository configuration. Any divergence is a bug that must be corrected.

### Configuration Over Convention
Everything that can be configured declaratively must be. Shell aliases, Git configuration, MCP server assignments, provider settings — all expressed in files.

### Documentation Lives With Code
Documentation that describes configuration lives adjacent to the configuration it describes. Architecture docs describe the system as it is, not as it was imagined.

### Secrets Never Touch Disk
API keys, tokens, passwords, and credentials are never stored in repository files. They flow from the SWAS box Secrets → `devcontainer.json` `remoteEnv` → process environment → `{env:VAR}` references.

### Immutable History
The changelog is append-only. Backup reports are timestamped. Every significant change is traceable.

## Security Requirements

- No secrets in repository files (enforced by `.gitignore` and periodic scans)
- All secrets sourced from the SWAS box Secrets
- Secrets documented by name and purpose only, never by value
- Security scan script available for pre-commit validation
- `.gitignore` blocks: `.env*`, `*.pem`, `*.key`, `credentials*`, `secrets*`

## Recovery Requirements

- `devcontainer.json` must declare all required environment variables
- `.devcontainer/setup.sh` must install all required software
- Recovery playbook must document step-by-step restoration
- Recovery checklist must be verifiable
- Recovery gap analysis updated after every significant change

## Documentation Requirements

| Document | Purpose | Update Trigger |
|----------|---------|---------------|
| `WORKBENCH_CHARTER.md` | Governance | Structural changes |
| `security-model.md` | Security architecture | Security changes |
| `CHANGELOG_WORKBENCH.md` | Change history | Every change |
| `architecture/*` | System documentation | Configuration changes |
| `recovery/*` | Recovery procedures | Process changes |
| `prompts/*` | Prompt library | Prompt changes |
| `backup-reports/*` | Backup snapshots | Each backup run |

## Ratification

This charter is effective immediately upon commit to the `main` branch. Amendments require a documented change in `CHANGELOG_WORKBENCH.md`.
