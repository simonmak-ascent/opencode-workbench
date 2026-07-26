---
name: dependency-audit
description: Audit project dependencies for security, licensing, freshness, and bloat
license: MIT
compatibility: opencode
metadata:
  domain: research
  audience: developers-security
---

## What I do

- Audit all project dependencies (direct and transitive) for vulnerabilities, license compliance, staleness, and unnecessary bloat
- Identify upgrade paths, breaking changes, and removal candidates
- Produce a prioritized action plan for dependency hygiene

## When to use me

Use when: doing a security audit, preparing for a major upgrade, reducing bundle size, or ensuring license compliance. Trigger phrases: "audit my dependencies", "check for vulnerable packages", "find unused dependencies", "review licenses for...".

## Workflow

1. Parse the project's dependency manifests (package.json, Cargo.toml, go.mod, requirements.txt, etc.)
2. Check each dependency against:
   - Security: known CVEs using available vulnerability databases
   - Licensing: flag incompatible or restrictive licenses
   - Freshness: how far behind latest stable? Any abandoned packages?
   - Usage: is the dependency actually imported? Can it be removed or replaced?
   - Bloat: large transitive trees, duplicate versions
3. For outdated packages, check changelogs for breaking changes in newer versions
4. Group findings by severity: critical (security), high (breaking changes), medium (upgrades available), low (cleanup)
5. Output a prioritized action plan with specific upgrade commands

## Output format

```markdown
# Dependency Audit: [Project]
## Summary
- Total deps, outdated, vulnerable, unused
## Critical Issues (Security)
## High Priority (Breaking Changes)
## Medium Priority (Upgrades Available)
## Low Priority (Cleanup)
## License Compliance
## Upgrade Plan with Commands
```
