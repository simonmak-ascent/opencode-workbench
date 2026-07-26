# Prompt Index

> Maintained as part of workstation preservation. Updated: 2026-07-26

## Active Prompts

| # | Title | File | Purpose | When To Use | Owner | Modified |
|---|-------|------|---------|-------------|-------|----------|
| 1 | Software Bootstrap | software-bootstrap.md | Install data processing, ETL, and conversion tools | After fresh codespace creation | DevOps | 2026-07-25 |
| 2 | Workstation Preservation | workstation-preservation.md | Full workstation backup and recovery procedure | Monthly or after major changes | DevOps | 2026-07-25 |

## Prompt Categories

### Workstation Prompts
- `workstation-preservation.md` — Complete preservation workflow (21-phase audit)
- `software-bootstrap.md` — Data tooling installation (pandoc, miller, csvkit, etc.)

### Maintenance Notes

- All prompts are stored as markdown files in `docs/prompts/`
- Each prompt includes: title, purpose, when-to-use, author, modification date
- Prompt changes are tracked in `docs/CHANGELOG_WORKBENCH.md`
- New prompts should be added to this index immediately

## Related Documentation

- `docs/environment-inventory.md` — Environment variable map
- `docs/codespaces-secrets.md` — Secrets management
- `docs/recovery-gap-analysis.md` — Disaster recovery gaps
- `configs/mcp/` — MCP server architecture
- `configs/opencode/` — OpenCode configuration
- `docs/backup-reports/` — Dated backup snapshots
