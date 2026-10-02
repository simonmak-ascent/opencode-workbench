---
name: vdd-clone
description: >
  Turn a `vdd:clone` manifest into a live, operational cloned website with the same
  UI/UX and a functional backend (Payload CMS + Next.js + self-hosted Postgres). Use
  after `vdd e2e -clone <domain>` produces vdd/clone-manifest.json, or when the user
  asks to "clone a site", "scaffold the clone", "deploy the clone", or "make the clone
  live". Covers: scaffold generator (scripts/vdd-clone-scaffold.mjs), build on SWAS
  (cs run), self-hosted deploy (docker compose + cs tunnel), seed, and fidelity audit.
---

# vdd-clone — manifest → live site

The `vdd` MCP's `clone` phase is the **orchestration** layer: it crawls the
target, detects its CMS, infers the content model, and emits
`vdd/clone-manifest.json`. This skill is the **execution** layer: it turns that
manifest into a running Next.js (App Router) + Payload 3 + Postgres site with
the original's design tokens, locales, and content model.

## When to use

- After `vdd e2e -clone <domain>` (or `/vdd:clone`) writes `vdd/clone-manifest.json`.
- The user wants a **live, operational** clone — not just a spec.

## Workflow

### 1. Get the manifest

```
vdd e2e -clone <domain>     # or the vdd_clone MCP tool (projectRoot = site root)
```

Confirms `vdd/clone-manifest.json` exists with `locales`, `collections`,
`relationships`, `designSystem`, `deploy`, and (optionally) `donation`.

### 2. Scaffold at the project root

```
node <skill-repo>/scripts/vdd-clone-scaffold.mjs --manifest vdd/clone-manifest.json --out .
```

The repo root (`.`) becomes the cloned-site root. The generator emits:
- `payload.config.ts` — collections, Postgres adapter, i18n locales, admin, sharp
- `src/collections/*.ts` — one Payload collection per inferred entity (localized + relationship fields)
- `src/app/(payload)/…` — admin panel + REST route
- `src/app/(app)/…` — token-faithful frontend shell (nav/footer from design tokens)
- `docker-compose.yml` + `Dockerfile` — self-hosted `postgres:16-alpine` + app
- `src/seed.ts` — seed the first page

### 3. Configure

```
cp .env.example .env     # set PAYLOAD_SECRET (and DATABASE_URI stays the compose value)
```

### 4. Build on SWAS (never locally)

```
cs provision                       # first time
cs run "pnpm install && pnpm build"
```

### 5. Deploy (open source, self-hosted — no managed DB)

```
cs run "docker compose up -d --build"
ssh -N -L 3001:localhost:3001 workbench   # access http://localhost:3001
```

The app runs on host port **3001** (3000 is Browserless on the box); Postgres is
`postgres:16-alpine` on host 5433. Payload auto-migrates on boot.

### 6. Seed + verify

```
cs run "env DATABASE_URI=postgres://clone:clone@localhost:5433/clone PAYLOAD_SECRET=<secret> pnpm run seed"
```

Checks: `/admin` loads; `/api/pages` returns data; all locales render;
fidelity audit vs the original.

## Fidelity audit

Use the `clone-audit` skill (screenshot diff via Playwright + pixelmatch, links
crawler, a11y axe-core) or `difflens` to compare the clone against the original
and iterate on gaps.

## Rules

- **Never run compute locally** — `pnpm install/build`, `tsc`, `docker` all go
  through `cs run` on the SWAS box.
- **Open-source DB only** — self-hosted Postgres via docker compose (no Neon).
- **No hardcoded secrets** — `PAYLOAD_SECRET` from `.env`; Stripe keys via env,
  and wire donations with `stripe-best-practices` (Checkout Sessions).
- The clone root is the project root (`.`), not a nested `vdd/clone-site/`.

## References

- Engine: `$HOME/git_repo/vision_driven_design/packages/vdd-engine/`
- Playbook: `$HOME/git_repo/vision_driven_design/references/clone-playbook.md`
- Scaffold generator: `$HOME/git_repo/vision_driven_design/scripts/vdd-clone-scaffold.mjs`
