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
   - Search all tracked files for secret patterns: sk-, ghp_, github_pat_, pplx-, figd_, sntryu_, BSA, api_key=, token=, password=
   - Search for common credential filenames: .env, credentials.json, secrets.yaml, *.pem, *.key
   - Check git history for any previously committed secrets

2. CONFIGURATION AUDIT:
   - Verify .gitignore blocks all sensitive file patterns
   - Verify opencode.json uses {env:VAR} syntax (no hardcoded keys)
   - Verify devcontainer.json uses ${localEnv:VAR} syntax
   - Check for any IP addresses, internal URLs, or hostnames that shouldn't be public

3. ACCESS AUDIT:
   - Check repository visibility (public/private)
   - Verify no personal email addresses in commit history
   - Check for exposed internal paths or usernames

4. REPORT:
   - Findings by severity (critical, high, medium, low)
   - Recommended remediations
   - If ANY critical finding: abort and alert

NEVER expose actual secret values in your report.
```
