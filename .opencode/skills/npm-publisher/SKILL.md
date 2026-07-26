---
name: npm-publisher
description: Publish packages to npm registries with proper versioning and provenance
license: MIT
compatibility: opencode
metadata:
  domain: publishing
  audience: maintainers-library-authors
---

## What I do

- Publish packages to npm (public or private registries) following best practices
- Configure package.json fields, exports map, TypeScript types, and npm provenance
- Handle pre-release tags, deprecation, and canary releases

## When to use me

Use when: publishing an npm package, setting up package.json for publishing, configuring exports, or managing package versions. Trigger phrases: "publish this package...", "prepare for npm publish...", "configure package.json for publishing...", "set up npm provenance...".

## Workflow

1. Audit package.json for publishing readiness:
   - `name`: scoped or unscoped, matches npm registry
   - `version`: follows semver
   - `description`: clear, one-line
   - `license`: SPDX identifier (MIT, Apache-2.0)
   - `repository`: correct URL and directory (for monorepos)
   - `keywords`: 5-10 relevant keywords
   - `files`: explicit list or `.npmignore` — exclude tests, configs, source maps if not needed
   - `main`, `module`, `types`: correct entry points
   - `exports`: conditional exports map for modern packages
   - `engines`: Node.js version requirements
   - `publishConfig`: registry, access level, provenance
2. Run pre-publish checks:
   - `npm pack --dry-run` to verify included files
   - `npm run build` passes
   - Tests pass
   - No sensitive files included
3. Set up npm provenance (recommended):
   - Add `"publishConfig": { "provenance": true }` to package.json
   - Configure GitHub Actions with `id-token: write` permission
4. For scoped packages: ensure `publishConfig.access` is set (`public` or `restricted`)
5. For canary/pre-release: use `--tag next` or `--tag canary`
6. After publish: verify `npm info <package>` shows correct metadata

## Pre-publish checklist

- [ ] `npm pack --dry-run` shows expected files
- [ ] `exports` field is correct (CJS + ESM)
- [ ] `types`/`typings` points to generated `.d.ts`
- [ ] `files` array or `.npmignore` excludes source, tests, configs
- [ ] `engines` field matches tested Node.js versions
- [ ] README is up to date
- [ ] CHANGELOG entry for this version
- [ ] Git tag exists for this version
