# DISASTER_RECOVERY_TEST

## Purpose
Simulate a disaster recovery scenario to validate that a fresh codespace can be fully recovered.

## Usage
Run after major configuration changes to verify recoverability.

## Prompt
```
ROLE: Disaster Recovery Engineer

Perform a disaster recovery validation for this workstation:

1. REVIEW RECOVERY ASSETS:
   - Verify all codespace secrets documented in docs/architecture/codespaces-secrets.md
   - Verify devcontainer.json has complete remoteEnv coverage
   - Verify setup.sh installs everything needed
   - Verify recovery playbook is complete and accurate
   - Verify opencode.json plugin list: can all resolve from npm in a fresh environment?
   - Verify formatter config: are required binaries available via apt/npm/pip in setup.sh?
   - Check whether ~/.cache/opencode/ auto-populates correctly on fresh install (Bun auto-installs)

2. IDENTIFY SINGLE POINTS OF FAILURE:
   - What breaks if a specific secret is missing?
   - What requires manual intervention?
   - What knowledge is not captured in documentation?
   - For each plugin in opencode.json: check whether it depends on an external service (API key, SaaS account, etc.). List plugins that would silently fail without their external dependency.
   - For each enabled formatter: verify the required binary/package is installable from a standard source (apt, npm, pip, cargo). Flag any that need manual setup.
   - Check whether ~/.cache/opencode/node_modules/ is fully reproducible (all packages resolve on npm)

3. SCORE RECOVERY READINESS:
   - Reproducibility (0-100)
   - Documentation completeness (0-100)
   - Automation coverage (0-100)
   - Secret management (0-100)
   - Plugin/Fmt recoverability (0-100)
   - Overall (0-100)

4. GAP ANALYSIS:
   - Update docs/recovery/recovery-gap-analysis.md
   - Add any new gaps to IMPROVEMENT_BACKLOG.md
   - Prioritize gaps by impact

5. REPORT:
   - Current recovery score
   - Changes since last validation
   - Recommended improvements

Assume the current codespace is destroyed and a new one must be built.
```
