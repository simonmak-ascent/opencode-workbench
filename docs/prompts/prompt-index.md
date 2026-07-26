# Prompt Index

> Purpose: Catalog of all reusable prompts for workstation operations.
> Updated: 2026-07-26

## Backup Prompts

| Prompt | Purpose | Usage | Dependencies |
|--------|---------|-------|-------------|
| [MASTER_WORKBENCH_BACKUP.md](MASTER_WORKBENCH_BACKUP.md) | Full inventory + security + commit prep (with fallbacks) | Major backup events | `scripts/backup/`, `scripts/inventory/`, `scripts/security/` (graceful degradation if missing) |
| [RUN_MASTER_BACKUP.md](RUN_MASTER_BACKUP.md) | Execute master backup with fallback to manual workflow | Routine backup | `scripts/backup/run-master-backup.sh`, or fallback to MASTER_WORKBENCH_BACKUP.md |
| [QUICK_BACKUP.md](QUICK_BACKUP.md) | Rapid state preservation with config discovery | Before risky operations | `scripts/security/scan-secrets.sh` (graceful fallback) |

## Audit Prompts

| Prompt | Purpose | Usage | Dependencies |
|--------|---------|-------|-------------|
| [WORKSTATION_REVIEW.md](WORKSTATION_REVIEW.md) | Comprehensive workstation audit (config, MCP, plugins, formatters, cache, docs, env) | Periodic review | `scripts/security/scan-secrets.sh` |
| [SECURITY_AUDIT.md](SECURITY_AUDIT.md) | Deep security scan + plugin supply chain audit | Pre-push validation | `scripts/security/scan-secrets.sh` |

## Recovery Prompts

| Prompt | Purpose | Usage | Dependencies |
|--------|---------|-------|-------------|
| [DISASTER_RECOVERY_TEST.md](DISASTER_RECOVERY_TEST.md) | Validate recovery readiness | Post-config changes | `docs/recovery/` |

## Operational Prompts

| Prompt | Purpose | Usage | Dependencies |
|--------|---------|-------|-------------|
| [software-bootstrap.md](software-bootstrap.md) | Install data processing tools | Fresh codespace setup | `scripts/bootstrap-tools.sh` |
| [workstation-preservation.md](workstation-preservation.md) | Full preservation as 10 DevOps roles | Comprehensive backup | All inventory scripts |

## Related Documentation

| Document | Location |
|----------|----------|
| Workstation Charter | `../WORKBENCH_CHARTER.md` |
| Security Model | `../security-model.md` |
| Recovery Playbook | `../recovery/RECOVERY_PLAYBOOK.md` |
| Disaster Recovery | `../recovery/DISASTER_RECOVERY.md` |
| Recovery Checklist | `../recovery/RECOVERY_CHECKLIST.md` |
| Improvement Backlog | `../IMPROVEMENT_BACKLOG.md` |
| Changelog | `../CHANGELOG_WORKBENCH.md` |
