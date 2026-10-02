# Security Policy

## Reporting a vulnerability

Please do **not** open a public issue for security problems. Report privately via
GitHub's [private vulnerability reporting](https://docs.github.com/en/code-security/security-advisories/guidance-on-reporting-and-writing-information-about-vulnerabilities/privately-reporting-a-security-vulnerability)
on this repository (Security → Report a vulnerability).

Include: affected component (`mcp-server/`, scripts, `opencode.json`), reproduction
steps, and impact. We aim to acknowledge within 3 business days.

## Secrets

This repository must never contain secret values. Provider and MCP credentials are
referenced only through `{env:VAR}` placeholders and are supplied at runtime from the
operator's environment (`~/.env.workbench` or the platform's secret store).

The `mcp-server/` clone tool writes only an **empty template** (`~/.env.workbench`,
mode `600`) to target machines; it never reads, transmits, or commits secret values.

## Automated controls

- `gitleaks` runs on every push and pull request (`.github/workflows/secret-scan.yml`).
- GitHub secret scanning and push protection are enabled on the repository.
