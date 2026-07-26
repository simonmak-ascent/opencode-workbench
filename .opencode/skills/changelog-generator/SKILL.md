---
name: changelog-generator
description: Generate structured changelogs from git history following keep-a-changelog format
license: MIT
compatibility: opencode
metadata:
  domain: publishing
  audience: maintainers
---

## What I do

- Generate changelogs from git commit history, PR titles, and conventional commits
- Follow the Keep a Changelog format with Added, Changed, Deprecated, Removed, Fixed, Security sections
- Group entries by type, highlight breaking changes, and link to PRs and contributors

## When to use me

Use when: preparing a release, generating release notes, or writing a changelog for an open-source project. Trigger phrases: "generate a changelog...", "write release notes for...", "what's changed since vX...", "create a changelog entry...".

## Workflow

1. Determine the version range (since the last release tag or a specific commit)
2. Gather changes from:
   - `git log` between tags with conventional commit parsing
   - Merged PR titles and descriptions
   - Issue references in commits (fixes #123, closes #456)
3. Categorize each change:
   - `Added` — new features
   - `Changed` — changes in existing functionality
   - `Deprecated` — soon-to-be-removed features
   - `Removed` — removed features
   - `Fixed` — bug fixes
   - `Security` — vulnerability fixes
4. Write clear, user-facing descriptions (not commit messages):
   - Good: "Added dark mode support with system preference detection"
   - Bad: "fix: dark mode" or "feat(darkmode): add toggle"
5. Link to PRs, issues, and contributor usernames
6. Flag breaking changes prominently
7. Follow the project's existing changelog format (CHANGELOG.md, GitHub Releases, etc.)

## Format

```markdown
# Changelog

## [v2.1.0] - 2026-07-26

### Added
- Dark mode support with system preference detection (#234)

### Changed
- Upgraded minimum Node.js version to 20 (#221)

### Fixed
- Resolved memory leak in WebSocket handler (#228)

### Security
- Patched dependency vulnerability in express@4.18.0 (#230)
```
