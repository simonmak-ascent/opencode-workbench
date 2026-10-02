# bootstrap-bare-host

Status: Active
Version: 1.0
Last updated: 2026-10-03

> Impact Chain: V-001 → S-002 → T-003 → SP-004

## Tactical Origin

Implements: `vdd/tactics.md` → Action Items A-001 … A-007 (Pillars P1–P5).

## Overview

Add a single MCP tool, `bootstrap_host`, that turns a bare Linux target
(local or over SSH) into a VDD-configured OpenCode workstation in one call: it
scans the platform from the kernel up, returns a dry-run upgrade plan, installs
the latest stable OpenCode while recording the resolved version, applies the VDD
profile configuration, and verifies parity. A `help` parameter documents every
parameter without contacting the target. Serves Impacts I-001 … I-005.

## User Stories

### Primary

As the operator, I want one MCP call (with a `help` flag and optional
parameters) that provisions a bare Linux box — local or remote — with the
latest stable OpenCode and the VDD profile, so I spend minutes not hours and
never touch a secret.

## Boundaries

**Always do:**
- Validate inputs with Zod at the tool boundary.
- Run the platform scan as a **plan** (no execution) unless `upgrade: true`.
- Capture the resolved OpenCode version in the result.
- Call `verify` before returning success.
- Keep secret values out: env template (names only) at mode 600.

**Ask first:**
- Executing a platform upgrade (`upgrade: true`) — requires root/sudo.
- Changing `opencodeVersion` away from latest stable.

**Never do:**
- Read, transmit, or log secret values.
- Auto-reboot a host.
- Break or alter the existing six tools' schemas.

## Acceptance Criteria

### AC-1: `help` is target-free [MUST]
Given `bootstrap_host` is called with `help: true`
When the call is handled
Then it returns a documentation object listing every parameter (name, type,
required, description) and makes **no** target/SSH/network call.

### AC-2: Platform report from kernel up [MUST]
Given any target
When `bootstrap_host` runs
Then the result includes `platform` with `osId`, `osName`, `osVersion`,
`kernel`, `arch`, `packageManager`, and `family`, plus an `upgrade` object with
ordered `commands` derived from the detected manager.

### AC-3: Dry-run-first upgrade plan [MUST]
Given `upgrade` is omitted or `false`
When `bootstrap_host` runs
Then `upgrade.executed` is `false` and no upgrade command is run.

### AC-4: Latest stable OpenCode installed + version recorded [MUST]
Given a target without OpenCode (or with an older one)
When `bootstrap_host` runs
Then the `opencode` component is installed and the result reports
`opencode.version` equal to `opencode --version`, honoring an explicit
`opencodeVersion` override when supplied.

### AC-5: VDD config applied and verified [MUST]
Given a target after installation
When `bootstrap_host` completes
Then the `opencode.json`, `AGENTS.md`, skills and plugins are written and the
embedded `verify` result has `configExists: true` with no missing core
components.

### AC-6: Idempotent [MUST]
Given a target already provisioned
When `bootstrap_host` runs again
Then no component is re-installed (`installed` is empty) and the core check
passes.

### AC-7: Secret-value-free [MUST]
Given any run
When files are written
Then only the rendered `opencode.json`-style config and an **empty**
`~/.env.workbench` (environment variable names only, mode 600) are created; no
secret value is read, transmitted or logged.

### AC-E1: Unsupported package manager [MUST]
Given a distro whose manager is not in {apt-get, dnf, yum, apk, pacman, zypper}
When `bootstrap_host` runs
Then `platform.packageManager` is `null`, `upgrade.commands` is empty, a
warning is reported, and the call does not fail.

### AC-E2: SSH/target failure [MUST]
Given an unreachable SSH target
When `bootstrap_host` runs
Then it returns a structured error (`isError: true`) with a message naming the
target, without throwing an uncaught exception.

### AC-E3: `help:true` overrides other inputs [SHOULD]
Given `help: true` and a `target` value
When the call is handled
Then documentation is returned and the target is not contacted.

## Out of Scope

- Windows/macOS targets.
- Secret provisioning / value transport.
- Unattended kernel/OS reboots.
- Immutable-OS families (NixOS/Flatcar).

## Open Questions

- Resolved: Flatpak/Snap upgrade planning is **out of scope** for this spec
  (recorded under Out of Scope; revisit as a future SHOULD). No clarification
  outstanding.

## Non-Functional Requirements

- Read-only paths (`help`, plan) must not modify the target.
- `platform.ts` pure functions must be deterministic and side-effect free.
- No new runtime dependency (use existing Node builtins + Zod).
- Result objects must be Zod-declared output schemas for TDQS quality.

## Impact Verification

- AC-1, AC-6 → I-001 (minimal commands) and I-005 (`help`).
- AC-2, AC-3 → I-002 (kernel-up scan).
- AC-4 → I-003 (latest stable + pin).
- AC-5, AC-7 → I-004 (VDD config parity, secret-safe).

## S&T Assumptions (Specs → Plan)

**Necessity:** The plan must place pure platform logic in a testable module and
keep orchestration thin in the tool layer.

**Achievability:** Existing `inspect`/`apply`/`verify` + a new pure module cover
every Must AC without network or root (upgrade execution is opt-in).

**Sufficiency:** AC-1…AC-7 + edge cases fully cover the four vision impacts.

**Warnings:** Keep the existing tools untouched; version capture depends on the
opencode binary being on PATH after install.
