---
name: semantic-release
description: Set up and execute semantic versioning with automated release workflows
license: MIT
compatibility: opencode
metadata:
  domain: publishing
  audience: maintainers-devops
---

## What I do

- Set up automated semantic release workflows using conventional commits
- Configure commitlint, commitizen, or semantic-release to enforce and automate versioning
- Handle monorepo versioning with tools like Changesets or Lerna

## When to use me

Use when: setting up automated releases, enforcing conventional commits, configuring semantic-release, or managing monorepo versioning. Trigger phrases: "set up semantic release...", "automate versioning...", "configure conventional commits...", "set up changesets...", "enforce commit message format...".

## Workflow

1. Detect the project type:
   - **Single package**: semantic-release, standard-version, or release-please
   - **Monorepo**: Changesets, Lerna, or Turborepo with independent versioning
2. For conventional commits enforcement:
   - Install and configure commitlint with `@commitlint/config-conventional`
   - Add a commit-msg hook (husky or lefthook)
   - Configure commitizen for interactive commits (`npm run commit`)
3. For automated releases (single package):
   - Install semantic-release and plugins
   - Configure `.releaserc` or `release.config.js`:
     - Analyze commit types to determine version bump
     - Generate changelog
     - Publish to npm
     - Create GitHub release
   - Set up CI workflow that runs `npx semantic-release` on main branch push
4. For monorepo (Changesets):
   - Initialize changesets: `npx changeset init`
   - Configure `.changeset/config.json` with:
     - `commit`: true (auto-commit version bumps)
     - `access`: "public" or "restricted"
     - `baseBranch`: "main"
     - `updateInternalDependencies`: "patch"
   - Set up CI: `npx changeset version` on main, `npx changeset publish` after
5. Document the commit convention for the team:
   - `feat:` → MINOR bump
   - `fix:` → PATCH bump
   - `feat!:` or `BREAKING CHANGE:` footer → MAJOR bump
   - `docs:`, `style:`, `refactor:`, `perf:`, `test:`, `chore:`, `ci:` → no bump

## CI workflow template (GitHub Actions + semantic-release)

```yaml
name: Release
on:
  push:
    branches: [main]
jobs:
  release:
    runs-on: ubuntu-latest
    permissions:
      contents: write
      issues: write
      pull-requests: write
      id-token: write
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npx semantic-release
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
```
