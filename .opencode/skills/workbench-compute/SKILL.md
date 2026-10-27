---
name: workbench-compute
description: Run compute and tests on one of the persistent Alibaba Cloud ECS compute nodes (ecs-01, ecs-02 — the `apg-prod` fleet) via the `cs` helper — prefer the most-resourced via `cs best`. Use whenever the user asks to run tests, type-check, lint, build, install deps, or verify code — and whenever a `cs` command is needed (cs best/run/setup/sync/provision/pull/ssh/cp/login/win-setup/tunnel). Never run compute locally.
---

# Compute offload via `cs`

The persistent Alibaba Cloud **ECS** compute fleet — `ecs-02` (SSH alias
`ecs-02`, default, `root`) and `ecs-01` (alias `ecs-01`, root) — is the only
place compute runs. Key `~/.ssh/apg-prod-key`; VPC `apg-prod-vpc`
(`10.20.0.0/16`, `cn-hongkong`). The `cs` helper (`~/.config/opencode/bin/cs`,
on PATH at `~/.local/bin/cs`) drives them from any repo directory, keeping each
box copy under git control. **Prefer the node with the most free resources:** run
`cs best` to probe the pool and switch. Topology/services/ports:
`~/.config/opencode/docs/boxes.md`; ids: `apg-infra/docs/inventory.md`.

## Golden rule

**Never run compilation/testing/build/lint/type-check/install locally.** Offload
everything to a compute box through `cs` (prefer `cs best` first). Local is for
editing + git + MCP only.

## Commands (quick reference)

```bash
cs best                 # probe the pool; switch to the most-resourced provisioned node
cs host [<host>]        # print/set the active node (e.g. cs host ecs-01; ecs-02 default)
cs open                 # create/reuse a box working copy (+ deps); session start
cs setup                # one-time: git-clone the repo on the box + install deps
cs provision            # setup + sync + install deps (first time for a new repo)
cs sync                 # ensure clone exists, rsync this worktree on top (incl. uncommitted)
cs run "<cmd>"          # sync + run a command, e.g. cs run "pnpm check && pnpm test"
cs pull                 # git pull on the box (sync committed state)
cs ssh "<cmd>"          # raw command on the box (no sync — preferred for commands)
cs cp <file> remote:<p> # copy a file to the box (literal `remote:` prefix required)
cs close                # remove the box working copy (refuses if dirty / box-owned)
cs gc [--ttl <hours>]   # reap box working copies idle > TTL (default 12h)
cs gc-install           # install the idle-reaper systemd timer on the box
cs login                # print WSL/Windows login instructions
cs win-setup            # one-time: create Windows SSH key + config (PowerShell ssh ecs-02)
cs tunnel               # SSH-forward the shared browserless port to localhost (the opencode UI is an ALB rule to the app's port — no node-side proxy)
```

> **Ingress:** the ALB is the only ingress and it routes to the app's own port; nginx is the only
> web server on a node. There is no node-side routing proxy to configure or restart — authority is
> `~/git/apg-infra/docs/standards.md`.

> **Pin the host.** `~/.config/opencode/cs-host` can be flipped by another session (e.g. to a host
> with no clone/creds) — prefix `CS_HOST=ecs-02 cs …`, or run `cs host ecs-02` (with an argument) to
> persist it. `cs run` rsyncs your worktree over the box **with `--delete`**; use `cs ssh` for
> commands so box-only files are not wiped.

## Ephemeral workspaces (policy)

**GitHub is the only repo store.** A box working copy exists only while a task
runs and is removed afterwards — `cs close` removes it, and a per-box systemd
timer (`cs gc-install`, hourly) reaps copies idle longer than `CS_TTL_HOURS`
(default 12). Neither discards uncommitted work: both save a `/tmp/cs-close-*
.tracked.patch` and stop, and neither touches a repo marked `.cs-box-workspace`
(that repo's box copy is the source of truth). pnpm/uv **stores persist** (they
are caches, not repos), so re-clones install fast.


## First time (new repo)

```bash
cs provision            # clones /workspaces/<repo-name> + installs pnpm/uv deps
cs run "pnpm check && pnpm test"
```

`cs provision` is enough once per repo; after that use `cs run` (or `cs sync`
then `cs ssh`). The box workspace lives at `/workspaces/<repo-name>` and is a
git clone with identity `simonmak-ascent@users.noreply.github.com`.

## Day-to-day verification

```bash
cs run "pnpm check"          # tsc --noEmit (slow, 2–4 min)
cs run "pnpm test"           # vitest run
cs run "pnpm build"          # next build
cs run "npx vitest run tests/unit/foo.test.ts"   # single test
```

For Python projects: `cs run "uv run pytest"` (deps via `uv sync`).

## Login

- **WSL:** `ssh ecs-02`
- **Windows (PowerShell):** `ssh ecs-02` — after one-time `cs win-setup`
  (generates `C:\Users\<you>\.ssh\ecs-02_ed25519`, adds it to the box, writes
  the config). Re-run is idempotent.

## Gotchas (hard-won)

- **Git control + `safe.directory`:** `cs sync`/`cs run` keep the box a git clone
  and rsync the worktree on top (`.git` excluded so history/origin persist).
  Ownership mismatches trigger git's "dubious ownership" error — `cs setup`
  already adds `safe.directory`, but if it recurs:
  `cs ssh "git config --global --add safe.directory /workspaces/<name>"`.
- **Secrets never sync:** `.env*` is excluded (`.env.example` kept). Set real
  env vars on the box directly, not via `cs`.
- **Unquoted env on the box:** systemd `EnvironmentFile` doesn't strip quotes,
  so the worker `.env` must be unquoted and free of `$`/spaces/`#`.
- **Deps persist:** `node_modules`/`.next`/`dist` are excluded from sync, so a
  prior `cs provision` survives later `cs run`s.
- **Package managers:** pnpm via corepack (`packageManager` field pins the
  version); Python via `uv`. `cs` picks pnpm when `package.json` exists, `uv`
  when `pyproject.toml`/`requirements.txt` exists.
- **Private GitHub repos:** the box authenticates GitHub through `gh`
  (`gh auth setup-git`); `cs setup` clones via the repo's `origin` remote
  (ssh URLs auto-rewritten to https). Repos without an origin rsync their full
  tree (incl. `.git`) instead.
