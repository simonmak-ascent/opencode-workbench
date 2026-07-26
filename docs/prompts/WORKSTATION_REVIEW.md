# WORKSTATION_REVIEW

## Purpose
Comprehensive audit of the workstation: configuration, security, MCP health, documentation completeness.

## Usage
Run periodically to detect drift and issues.

## Prompt
```
ROLE: Senior DevOps Engineer + Security Auditor + Configuration Manager

Review this workstation comprehensively:

1. AUDIT CONFIGURATION:
   - Compare ~/.config/opencode/opencode.json against repo opencode.json
   - Verify devcontainer.json remoteEnv has all required vars
   - Check .gitignore covers all runtime artifacts

2. AUDIT SECURITY:
   - Run bash scripts/security/scan-secrets.sh
   - Verify no API keys, tokens, or passwords in tracked files
   - Check that .env files are gitignored

3. AUDIT MCP HEALTH:
   - List all 19 MCP servers and their status
   - Identify any that failed to connect
   - For failed servers, diagnose and suggest fixes

4. AUDIT DOCUMENTATION:
   - Check every doc referenced in WORKBENCH_CHARTER.md exists
   - Verify all inventory docs are up to date
   - Flag stale or missing documentation

5. AUDIT ENVIRONMENT:
   - Compare actual env vars against docs/architecture/environment-inventory.md
   - Flag undocumented env vars
   - Flag documented but missing env vars

6. REPORT:
   - Summary of issues found (critical, high, medium, low)
   - Recommendations for fixes
   - Updated IMPROVEMENT_BACKLOG.md

Do not make changes without approval.
```
