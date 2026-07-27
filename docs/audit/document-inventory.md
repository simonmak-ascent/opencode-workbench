# Document Inventory

> Generated: 2026-07-27 | Phase: #0A
> Maps all required documentation per the agentic workflow system prompt against current state.

## Existing Docs (Verified)

| Path | Exists | Status | Owner | Related Runtime/Config |
|------|--------|--------|-------|----------------------|
| `docs/WORKBENCH_CHARTER.md` | YES | Approved | Architecture | `.devcontainer/`, `opencode.json` |
| `docs/security-model.md` | YES | Approved | Security | `scripts/security/scan-secrets.sh`, `opencode.json` |
| `docs/CHANGELOG_WORKBENCH.md` | YES | Approved | Operations | Git history |
| `docs/IMPROVEMENT_BACKLOG.md` | YES | Approved | Operations | None |
| `docs/security-audit-report.md` | YES | Draft | Security | `scripts/security/scan-secrets.sh` |
| `docs/mcp-inventory.md` | YES | Approved | Architecture | `opencode.json` |
| `docs/opencode-health-report.md` | YES | Draft | Operations | `scripts/maintenance/opencode-health-check.sh` |
| `docs/opencode-runtime-config.md` | YES | Draft | Architecture | `opencode.json` |
| `docs/architecture/ai-provider-inventory.md` | YES | Approved | Architecture | `opencode.json` providers section |
| `docs/architecture/codespaces-secrets.md` | YES | Approved | Security | `devcontainer.json` remoteEnv |
| `docs/architecture/environment-inventory.md` | YES | Approved | Architecture | `devcontainer.json` |
| `docs/architecture/home-directory-audit.md` | YES | Draft | Architecture | `~/.config/`, `~/.local/` |
| `docs/architecture/mcp-inventory.md` | YES | Approved | Architecture | `opencode.json` mcp section |
| `docs/architecture/opencode-runtime-config.md` | YES | Draft | Architecture | `opencode.json` |
| `docs/architecture/opencode-runtime-snapshot.md` | YES | Draft | Architecture | Runtime output |
| `docs/architecture/software-inventory.md` | YES | Approved | Architecture | `setup.sh`, `bootstrap-tools.sh` |
| `docs/architecture/workstation-inventory.md` | YES | Approved | Architecture | All configs |
| `docs/architecture/workstation-playbook.md` | YES | Approved | Operations | All scripts |
| `docs/recovery/RECOVERY_PLAYBOOK.md` | YES | Approved | Recovery | `.devcontainer/setup.sh` |
| `docs/recovery/DISASTER_RECOVERY.md` | YES | Approved | Recovery | All scripts |
| `docs/recovery/RECOVERY_CHECKLIST.md` | YES | Approved | Recovery | `scripts/recovery/validate-recovery.sh` |
| `docs/recovery/recovery-gap-analysis.md` | YES | Approved | Recovery | All configs |
| `docs/prompts/prompt-index.md` | YES | Approved | Operations | `docs/prompts/*.md` |
| `docs/prompts/MASTER_WORKBENCH_BACKUP.md` | YES | Approved | Operations | `scripts/backup/run-master-backup.sh` |
| `docs/prompts/RUN_MASTER_BACKUP.md` | YES | Approved | Operations | `scripts/backup/run-master-backup.sh` |
| `docs/prompts/QUICK_BACKUP.md` | YES | Approved | Operations | `scripts/security/scan-secrets.sh` |
| `docs/prompts/WORKSTATION_REVIEW.md` | YES | Approved | Operations | `scripts/inventory/*` |
| `docs/prompts/SECURITY_AUDIT.md` | YES | Approved | Security | `scripts/security/scan-secrets.sh` |
| `docs/prompts/DISASTER_RECOVERY_TEST.md` | YES | Approved | Recovery | `docs/recovery/*` |
| `docs/prompts/software-bootstrap.md` | YES | Approved | Operations | `scripts/bootstrap-tools.sh` |
| `docs/prompts/workstation-preservation.md` | YES | Approved | Operations | All inventory scripts |
| `docs/backup-reports/2026-07-25.md` | YES | Approved | Operations | Backup run |
| `docs/backup-reports/2026-07-26.md` | YES | Approved | Operations | Backup run |
| `docs/backup-reports/2026-07-27.md` | YES | Approved | Operations | Backup run |

## Required by Workflow Prompt — Currently Missing

| Path | Exists | Status | Owner | Phase Dependency |
|------|--------|--------|-------|-----------------|
| `docs/audit/document-inventory.md` | NOW | Draft | Architecture | Phase #0 |
| `docs/audit/documentation-quality-checklist.md` | NOW | Draft | Architecture | Phase #0 |
| `docs/audit/documentation-review-log.md` | NOW | Draft | Architecture | Phase #0 |
| `docs/audit/documentation-gaps.md` | NOW | Draft | Architecture | Phase #0 |
| `docs/audit/DOCS_QUALITY_APPROVED.flag` | NOW | Pending | Architecture | Phase #0 gate |
| `docs/research/01-ai-web-app-best-practices.md` | NO | — | Research | Phase #1 |
| `docs/research/02-mcp-agent-skills-best-practices.md` | NO | — | Research | Phase #1 |
| `docs/research/03-web-scraper-best-practices.md` | NO | — | Research | Phase #1 |
| `docs/research/04-free-tooling-options.md` | NO | — | Research | Phase #1 |
| `docs/research/RESEARCH_COMPLETE.flag` | NO | — | Research | Phase #1 gate |
| `docs/architecture/agents/` | NO | — | Architecture | Phase #2 |
| `docs/architecture/workflow-dag.md` | NO | — | Architecture | Phase #2 |
| `docs/architecture/workflow-dag.mermaid` | NO | — | Architecture | Phase #2 |
| `docs/architecture/agent-responsibilities.md` | NO | — | Architecture | Phase #2 |
| `docs/architecture/orchestration-rules.md` | NO | — | Architecture | Phase #2 |
| `docs/architecture/restart-recovery.md` | NO | — | Architecture | Phase #2 |
| `docs/architecture/tooling-decision-log.md` | NO | — | Architecture | Phase #2 |
| `docs/prompts/system-prompt.md` | NO | — | Architecture | Phase #2 |
| `docs/prompts/agent-prompts/` | NO | — | Architecture | Phase #2 |
| `docs/prompts/task-templates/` | NO | — | Architecture | Phase #2 |
| `docs/config/opencode-config.md` | NO | — | Architecture | Phase #2 |
| `docs/config/mcp-registry.md` | NO | — | Architecture | Phase #2 |
| `docs/config/environment-variables.md` | NO | — | Architecture | Phase #2 |
| `docs/config/tool-installation.md` | NO | — | Architecture | Phase #2 |
| `docs/config/reproducibility.md` | NO | — | Architecture | Phase #2 |
| `docs/config/tool-versions.md` | NO | — | Architecture | Phase #2 |
| `docs/design/design-principles.md` | NO | — | Architecture | Phase #2 |
| `docs/design/design-system.md` | NO | — | Architecture | Phase #2 |
| `docs/design/ui-patterns.md` | NO | — | Architecture | Phase #2 |
| `docs/design/figma-integration.md` | NO | — | Architecture | Phase #2 |
| `docs/tools/` | NO | — | Architecture | Phase #3 |

## Summary

- **Existing docs**: 34 files across 4 subdirectories
- **Missing required docs**: 31 files/directories
- **Audit Phase #0 docs**: 5 files (4 docs + 1 flag), all created now
- **Phase boundary status**: Can proceed through Phase #0; Phases #1-#3 all require creating new docs

## Scope Note

This repo is a devcontainer/codespace workstation configuration — not an application with AI web app, MCP server, or web scraper sources. The workflow prompt describes building these three domains from scratch. Missing docs in Phases #1-#3 are expected because those domains don't exist yet.
