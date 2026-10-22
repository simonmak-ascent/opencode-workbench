---
name: release-versioning
description: >
  Create versioned release folders for development artifacts (designs, specs,
  screenshots, generated code, implementation snapshots). Use when the user asks
  to "save a version", "create a release folder", "archive design files",
  "version the output", "organize release artifacts", or when producing
  deliverables that need to be tracked per version. Covers directory conventions,
  artifact types, the design↔implementation branching model, and automation
  scripts.
---

# Release Versioning

Create structured, versioned folders for all development artifacts so every
release has a complete, auditable record on GitHub.

## Directory Convention

```
<project>/
  design/releases/<ver>/       ← per-release design artifacts
  specs/<feature>/             ← per-feature SDD artifacts
```

### Version numbering

```
v1.0, v1.05, v1.10, v1.15 … v1.25 … v2.0
```

Format: `v<major>.<minor>` with zero-padded minor for sorting (1.05, not 1.5).
Use the version from `specs/ecosystem-v2/releases.md` or the release spec ID.

## `design/releases/<ver>/` — Standard Structure

```bash
mkdir -p design/releases/<ver>/{v0-output,frames}
```

| Path | Contents | Source |
|---|---|---|
| `design/releases/<ver>/design-brief.md` | Approval record: v0 chat webUrl, approver, date, design decisions | Human-authored |
| `design/releases/<ver>/*.png` | Screenshots of the approved design (desktop 1440, mobile 390) | Playwright or v0 preview |
| `design/releases/<ver>/v0-output/` | Generated source code (design reference, NOT production) | `v0 files <chatId>` |
| `design/releases/<ver>/frames/` | Additional design frames, variants, states | Playwright screenshots |

### Populate a release folder

```bash
# 1. Create folder
VER="1.30"
mkdir -p design/releases/$VER/{v0-output,frames}

# 2. Dump v0 generated source (design reference)
v0 files <chatId> design/releases/$VER/v0-output/

# 3. Screenshot the v0-deployed Vercel preview
#    (via vercel_get_deployment → vercel_get_access_to_vercel_url → Playwright)
mv screenshot-*.png design/releases/$VER/

# 4. Write design-brief.md (template below)
```

### `design-brief.md` Template

```markdown
# Release <ver> — Design Brief: <feature-name>

Release: <ver> · Codename: <codename>
Status: Draft — awaiting design-gate approval
Designer: <name>

## What this design is for
<1-3 sentences>

## Frames / Screenshots
| # | Frame | Viewport | Notes |
|---|---|---|---|
| 1 | <name> | 1440 | <description> |

## Token Reference
All values from `src/styles/tokens.json`. Key values used:

## Approval Record
| Field | Value |
|---|---|
| v0 chat webUrl | https://v0.app/chat/<chatId> |
| Vercel deployment | <deploymentId> |
| Approver | _pending_ |
| Date | _pending_ |
```

## `specs/<feature>/` — SDD Artifacts

```bash
mkdir -p specs/<feature>
```

| File | Contents | Phase |
|---|---|---|
| `spec.md` | Requirements + acceptance criteria (MoSCoW) | Gateway 1 |
| `plan.md` | Implementation strategy + data model | Gateway 2 |
| `tasks.md` | Atomic task list with dependencies | Gateway 3 |
| `research.md` | Background research + alternatives considered | Optional |
| `decision_log.md` | Key decisions with rationale | Optional |
| `contracts/` | API schemas, data contracts | Gateway 2 |

## Branch → Folder Relationship

```
Branch                    → Folder                   → Purpose
────────────────────────────────────────────────────────────────
design/<ver>/<feature>    design/releases/<ver>/     v0-generated design reference
feat/<ver>/<feature>      (commits to src/)          hand-written implementation
specs/<feature>/          specs/<feature>/           SDD planning artifacts
```

## Automation Script

Save as `scripts/create-release.sh` in the project:

```bash
#!/usr/bin/env bash
# create-release.sh <ver> <feature>
# Creates: design/releases/<ver>/ + spec directory structure

VER="${1:?Usage: create-release.sh <ver> <feature>}"
FEATURE="${2:-feature}"

mkdir -p "design/releases/$VER"/{v0-output,frames}
mkdir -p "specs/$FEATURE"/contracts

cat > "design/releases/$VER/design-brief.md" << EOF
# Release $VER — Design Brief: $FEATURE

Release: $VER · Status: Draft — awaiting design-gate approval

## What this design is for

## Frames / Screenshots
| # | Frame | Viewport | Notes |
|---|---|---|---|

## Token Reference
All values from \`src/styles/tokens.json\`.

## Approval Record
| Field | Value |
|---|---|
| v0 chat webUrl | _pending_ |
| Vercel deployment | _pending_ |
| Approver | _pending_ |
| Date | _pending_ |
EOF

echo "Created design/releases/$VER/"
ls -la "design/releases/$VER/"
```

## When to Create a Release Folder

- **Before** the first v0 chat for a new release (so artifacts have a home from the start)
- **After** SDD spec is approved (Gateway 1) but before implementation starts
- **Anytime** you produce a versioned deliverable that needs to survive beyond the current session

## Quick Reference

| Task | Command |
|---|---|
| New release folder | `mkdir -p design/releases/<ver>/{v0-output,frames}` |
| New spec folder | `mkdir -p specs/<feature>/contracts` |
| Dump v0 files | `v0 files <chatId> design/releases/<ver>/v0-output/` |
| Screenshot preview | Playwright → `design/releases/<ver>/` |
| Write design brief | `cat > design/releases/<ver>/design-brief.md` (template above) |
| List all releases | `ls design/releases/` |
| Find a release by feature | `grep -rl "<feature>" design/releases/*/design-brief.md` |
