# Vision

Status: Draft
Version: 1.0
Last updated: 2026-10-03

> Impact Chain: V-001

## Vision Statement

A user who has **nothing but a bare Linux box** can bring that machine — local or
remote — to a fully provisioned OpenCode development workstation running the
**latest stable OpenCode**, with the VDD toolchain and this repository's MCP
servers, skills, `AGENTS.md`, and other config files applied, through a **single
MCP entry point with a minimal number of commands** (multiple parameters allowed,
including a `-help` reference). "Assuming nothing" means the tool scans the
underlying platform **from the kernel up** and upgrades what it finds, rather than
assuming a prepared base image.

## Impact Model

### Goal

Reduce "bare Linux box → VDD-configured OpenCode workstation" to one guided,
re-runnable MCP flow (≤ 3 commands) that scans/upgrades the host platform,
installs the latest stable OpenCode, and applies this repo's VDD-customized
configuration, on localhost or a remote SSH target.

### Actors

| Actor | Current State | Desired State | Benefit |
|-------|--------------|---------------|---------|
| Operator (repo owner) | Runs `cs`/`gh`, manually installs OS deps, `npx playwright install`, `opencode mcp auth`; must know internals | One MCP call with host + params; `-help` for the rest | Hours → minutes; fewer mistakes |
| Target Linux host | Unknown package state; OpenCode absent or version-pinned by hand | Platform scanned/upgraded; latest stable OpenCode + config applied | Deterministic, re-runnable, recoverable |
| Repo maintainer | Docs drift; no VDD artifacts; config counts inconsistent | VDD-traced artifacts; self-documenting `-help` | Traceable, verifiable change |

### Impacts

| Impact ID | Description | Actor | Measurement |
|-----------|-------------|-------|-------------|
| I-001 | Bare box provisioned to a ready workstation in minimal commands | Operator | Command count + wall-clock to `verify_clone` pass |
| I-002 | Underlying platform scanned and upgraded from the kernel up | Target host | % detected packages resolved; zero failed boots |
| I-003 | Latest stable OpenCode installed (version recorded) | Target host | Version freshness at run + captured pin record |
| I-004 | VDD MCP/skill/`AGENTS.md`/config applied on local **and** remote | Operator | Config-parity/drift check clean after apply |
| I-005 | Self-describing interface (`-help`) | Operator | Success reached without reading source |
| I-006 | Every MCP tool passes TDQS with no defects (target 5/5; floor tier A) | Operator / agent consumers | `mcp-tdqs lint` 0 errors; `mcp-tdqs score` tier + score |
| I-007 | Server discoverable in the top free MCP registries | Operator | Listed/live in Official MCP Registry + Glama + Smithery + PulseMCP + mcp.so |

## Stakeholder Map

| Role | Interest | Influence | Engagement Strategy |
|------|----------|-----------|---------------------|
| Operator (Simon) | Repeatable one-flow provisioning; no manual steps | High | Owns acceptance; runs `-help` flow |
| Target Linux host (local/remote) | Not broken by upgrades; correct services | Medium | Idempotent, opt-in destructive steps; verify after apply |
| Repo maintainer | Source-of-truth integrity; VDD traceability | High | VDD chain + CI drift assertion |
| Upstream (OpenCode, VDD, MCP) | Interface stability | Medium | Consume stable install channels; record versions |
| Security (gitleaks/CI) | No secret leakage | High | Connector never reads/transmits secrets; scans gate |

## Success Metrics

### Lagging Indicators

| Metric | Target | Measurement Method |
|--------|--------|--------------------|
| Time-to-provision (bare box → ready) | < 10 min | Instrumented provision + `verify_clone` timing |
| Fresh-host provision success rate | > 95% | `apply_clone`/`verify_clone` pass rate across N hosts |
| Recovery score retained | ≥ 95/100 | `docs/recovery/recovery-gap-analysis.md` |

### Leading Indicators

| Metric | Target | Measurement Method |
|--------|--------|--------------------|
| Commands to provision | ≤ 3 | Tool-call count from invocation to verified |
| Platform scan coverage | ≥ 90% of detected items resolved | Scan report (detected vs upgraded/deferred) |
| Post-apply config parity | 100% | Drift detector vs repo `opencode.json`/skills/`AGENTS.md` |
| `-help` completeness | 100% of parameters documented | Help output vs tool schema |

## Constraints & Boundaries

### Constraints

- Never store or transmit secret values — repo and connector write an empty
  `~/.env.workbench` template only.
- Compute is remote: builds/tests/typecheck run via `cs run` or CI, never on the
  editing workstation.
- Must support **local and remote (SSH)** targets and be idempotent/re-runnable.
- Must preserve reproducibility: "latest stable" must be **captured as a version
  pin at run time** so a provision is reversible and drift is detectable.
- No application code outside `mcp-server/` (root package is a launcher).
- Target may be assumed to have only a Linux OS and remote access — nothing else.

### Boundaries

- Not a Windows/macOS targeter (Linux only).
- Not a general config-management platform (not Ansible/Chef/Puppet).
- Does not provision secrets or credentials.
- Unattended destructive kernel/OS upgrades are **out of scope by default** —
  permitted only with an explicit opt-in parameter.

## Target Domains

- [x] Infrastructure
- [ ] WebApp
- [ ] Data Storage
- [ ] ETL

## S&T Assumptions (Vision → Strategy)

**Necessity:** Provisioning spans OS package management, version pinning,
configuration reconciliation, and remote execution. Strategy-level research
(distro/package-manager matrix, OpenCode install channels, VDD artifact layout,
SSH transport hardening) is required before any spec.

**Achievability:** The repo already implements `inspect_target` → `plan_clone` →
`apply_clone` → `verify_clone`, local + SSH transports, and `.devcontainer/setup.sh`.
Extending to platform scan/upgrade and an OpenCode bootstrap is incremental, not a
greenfield build.

**Sufficiency:** A guided MCP flow plus declarative config reconciliation and an
independent verify step covers the goal without external orchestration tooling.

**Warnings:** "Latest stable" conflicts with the constitution's reproducibility
principle unless the resolved version is captured; OS/kernel upgrades are
destructive and must be opt-in and reversible where possible; distro diversity
(kernel-up scanning across packaging systems) is the largest unknown; remote hosts
introduce secret-handling and reboot/availability risk; minimising command count
must not remove the verify gate.
