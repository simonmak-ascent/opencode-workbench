# SECURITY_AUDIT

## Purpose
Deep security audit of the repository for exposed secrets, misconfigurations, and vulnerabilities.

## Usage
Run before any push to ensure no secrets are committed.

## Prompt
```
ROLE: Security Auditor

Perform a deep security audit of this repository:

1. SECRET SCANNING:
   - Read docs/architecture/codespaces-secrets.md to discover active secret variable names
   - Dynamically derive secret patterns from the env vars actually in use (check prefixes/patterns in live env)
   - Search all tracked files for those patterns
   - Also check for generic credential patterns: api_key=, token=, password=, secret=, bearer
   - Search for common credential filenames: .env, credentials.json, secrets.yaml, *.pem, *.key
   - Search ~/.cache/opencode/ for cached credentials or plugin-stored secrets
   - Check git history for any previously committed secrets
   - Note: if you discover a new secret pattern not in the docs, flag it AND recommend updating docs/architecture/codespaces-secrets.md

2. CONFIGURATION AUDIT:
   - Verify .gitignore blocks all sensitive file patterns including .cache artifacts
   - Verify opencode.json uses {env:VAR} syntax (no hardcoded keys)
   - Verify opencode.json plugin section contains only trusted packages
   - Verify devcontainer.json uses ${localEnv:VAR} syntax
   - Check for any IP addresses, internal URLs, or hostnames that shouldn't be public
   - If new config sections appear that aren't covered here, flag them for prompt update

3. PLUGIN SUPPLY CHAIN AUDIT:
   - List all plugins declared in opencode.json
   - Verify each resolves to a legitimate npm package (not typosquatted)
   - Check for plugins requesting excessive permissions via hooks (shell.env, tool.execute.before)
   - Flag any plugin that injects env vars with hardcoded values rather than {env:VAR} references
   - Check plugin maintenance status (last publish date, deprecation flags)

4. ACCESS AUDIT:
   - Check repository visibility (public/private)
   - Verify no personal email addresses in commit history
   - Check for exposed internal paths or usernames

5. REPORT:
   - Findings by severity (critical, high, medium, low)
   - Recommended remediations
   - If ANY critical finding: abort and alert

NEVER expose actual secret values in your report.
```
