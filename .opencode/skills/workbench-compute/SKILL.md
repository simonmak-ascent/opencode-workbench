---
name: workbench-compute
description: Run compute and tests on one of the persistent Alibaba Cloud compute boxes (workbench, wcag-workforce, wcag-workforce-2) via the `cs` helper — prefer the most-resourced via `cs best`. Use whenever the user asks to run tests, type-check, lint, build, install deps, or verify code — and whenever a `cs` command is needed (cs best/run/setup/sync/provision/pull/ssh/cp/login/win-setup/tunnel). Never run compute locally.
---

# Compute offload via `cs`

Three persistent Alibaba Cloud compute boxes — `workbench` (SSH alias
`workbench`, root), `wcag-workforce` (`wcag-1`, admin) and `wcag-workforce-2`
(`wcag-2`, admin) — are the only place compute runs. The `cs` helper
(`~/.config/opencode/bin/cs`, on PATH at `~/.local/bin/cs`) drives them from any
repo directory, keeping each box copy under git control. **Prefer the box with
the most free resources:** run `cs best` to probe all three and switch.

## Golden rule

**Never run compilation/testing/build/lint/type-check/install locally.** Offload
everything to a compute box through `cs` (prefer `cs best` first). Local is for
editing + git + MCP only.

## Commands (quick reference)

```bash
cs best                 # probe all three boxes; switch to the most-resourced provisioned one
cs host [<host>]        # print/set the active box (e.g. cs host wcag-workforce-2)
cs setup                # one-time: git-clone the repo on the box + install deps
cs provision            # setup + sync + install deps (first time for a new repo)
cs sync                 # ensure clone exists, rsync this worktree on top (incl. uncommitted)
cs run "<cmd>"          # sync + run a command, e.g. cs run "pnpm check && pnpm test"
cs pull                 # git pull on the box (sync committed state)
cs ssh "<cmd>"          # raw command on the box
cs cp <file> remote:<p> # copy a file to the box
cs login                # print WSL/Windows login instructions
cs win-setup            # one-time: create Windows SSH key + config (PowerShell ssh workbench)
cs tunnel               # SSH-forward 4096 (opencode) / 3000 (browserless)
```

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

- **WSL:** `ssh workbench`
- **Windows (PowerShell):** `ssh workbench` — after one-time `cs win-setup`
  (generates `C:\Users\<you>\.ssh\workbench_ed25519`, adds it to the box, writes
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
