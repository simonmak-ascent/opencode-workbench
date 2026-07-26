---
name: release-manager
description: Orchestrate end-to-end release workflow from branch creation to publish
license: MIT
compatibility: opencode
metadata:
  domain: publishing
  audience: maintainers
---

## What I do

- Orchestrate a complete release workflow: branch creation, version bumping, changelog generation, tagging, and publishing
- Handle pre-release checks (tests pass, lint clean, build succeeds) and rollback procedures
- Support monorepo releases with independent versioning

## When to use me

Use when: cutting a release, managing release branches, or setting up release automation. Trigger phrases: "cut a release...", "prepare vX.Y.Z...", "release this version...", "bump version to...", "publish release...".

## Workflow

1. Run pre-release checks:
   - All CI checks passing on main
   - No outstanding critical/blocking issues for this milestone
   - Dependencies audited (no critical CVEs)
   - Changelog up to date
2. Determine the version bump:
   - Use semver: MAJOR.MINOR.PATCH
   - Breaking changes → MAJOR
   - New features (backward compatible) → MINOR
   - Bug fixes → PATCH
   - Pre-release: append -alpha.N, -beta.N, -rc.N
3. Create release branch: `release/vX.Y.Z`
4. Bump version in all relevant files (package.json, Cargo.toml, pyproject.toml, version.go, etc.)
5. Update changelog with the new version header
6. Commit and push the release branch
7. Create a PR from release branch to main (for review)
8. After merge, create a git tag: `git tag -a vX.Y.Z -m "Release vX.Y.Z"`
9. Push the tag: `git push origin vX.Y.Z`
10. Verify the release workflow triggers and publishes successfully
11. Post-release: bump to next dev version (e.g., 2.1.0 → 2.2.0-dev)

## Rollback procedure

If the release fails:
1. Delete the tag locally and remote: `git tag -d vX.Y.Z && git push --delete origin vX.Y.Z`
2. Revert the version bump commit
3. Fix the issue and restart the release process

## Monorepo considerations

For monorepos, determine if this is an independent package release or a synchronized release. Check for inter-package dependency changes.
