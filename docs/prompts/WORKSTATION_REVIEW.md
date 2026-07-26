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
   - Compare ~/.config/opencode/opencode.json against repo opencode.json (checksum + structural diff)
   - Verify formatter config is present and valid (check binaries exist for enabled formatters)
   - Verify plugin config is present (list all declared plugins, check npm resolution)
   - Verify devcontainer.json remoteEnv has all required vars
   - Check .gitignore covers all runtime artifacts including .cache patterns

2. AUDIT SECURITY:
   - Run bash scripts/security/scan-secrets.sh
   - Verify no API keys, tokens, or passwords in tracked files
   - Check that .env files are gitignored
   - Audit plugin packages for supply chain concerns (unusual packages, typosquatting)

3. AUDIT MCP HEALTH:
   - Count and list all MCP servers from opencode.json (dynamic — do not hardcode count)
   - Verify each server's status (connected/failed/unknown)
   - For failed servers, diagnose and suggest fixes
   - Check that MCP server binaries/entry points exist on disk

4. AUDIT PLUGIN & CACHE:
   - Verify all plugins declared in opencode.json resolve to valid npm packages
   - Check ~/.cache/opencode/node_modules/ for installed plugin state
   - Flag plugins that fail npm resolution or have deprecated versions
   - Verify plugin dependencies in ~/.cache/opencode/ are not stale
   - Check for local plugins in .opencode/plugins/ and ~/.config/opencode/plugins/

5. AUDIT DOCUMENTATION:
   - Read WORKBENCH_CHARTER.md to discover all referenced docs dynamically
   - Verify every referenced doc exists AND check for docs that exist but aren't referenced
   - Verify all inventory docs reflect current state (not stale)
   - Flag stale or missing documentation
   - Check that prompt-index.md reflects current prompt file inventory (compare against actual files in docs/prompts/)
   - If new doc categories are discovered, recommend adding them to WORKBENCH_CHARTER.md

6. AUDIT ENVIRONMENT:
   - Compare actual env vars against docs/architecture/environment-inventory.md
   - Flag undocumented env vars (distinguish: platform-injected vs manually set vs unknown)
   - Flag documented but missing env vars
   - If new env vars belong to active MCP servers or providers, recommend documenting them

7. REPORT:
   - Summary of issues found (critical, high, medium, low)
   - Recommendations for fixes
   - Updated IMPROVEMENT_BACKLOG.md
   - Note any gaps found in THIS prompt (WORKSTATION_REVIEW.md) itself — e.g., new config sections, new audit dimensions discovered during review

Do not make changes without approval.
```
