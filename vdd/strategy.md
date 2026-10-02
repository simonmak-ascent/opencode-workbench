# Strategy

Status: Active
Version: 1.0
Last updated: 2026-10-03

> Impact Chain: V-001 → S-002

## Vision Reference

Derived from: `vdd/vision.md` (bare Linux box → VDD-configured OpenCode
workstation in ≤ 3 commands, local or remote).

## Domain Primers Loaded

- `human-factors.md` (unconditional) — cognitive load, "minimum commands" UX.
- `verification-toolchain.md` (unconditional) — independent verify, CI quality gate.
- `infrastructure.md` (target domain) — provisioning, security, disaster recovery.
- webapp / data-storage / etl / safety-critical — not applicable (no web surface,
  no project datastore, no batch ETL, not safety-certified software).

## Research Synthesis

### Technology Landscape — OpenCode install

Canonical channels (upstream `anomalyco/opencode`, formerly `sst/opencode`):

- **Install script (primary):** `curl -fsSL https://opencode.ai/install | bash`.
  Supports `--version <v>`, `--binary <path>`, `--no-modify-path`; honors
  `$OPENCODE_INSTALL_DIR` / `$XDG_BIN_DIR`; default target `$HOME/.opencode/bin`.
- **Package managers:** `npm|pnpm|bun|yarn … opencode-ai@latest` (postinstall picks
  the native binary); `brew anomalyco/tap/opencode`; Arch `pacman -S opencode` / AUR.
- **Self-update:** `opencode upgrade [target] --method curl|npm|pnpm|bun|brew`.
- The repo's current `components.ts` installs **unpinned** (`curl … | bash`) and does
  not record the resolved version — a reproducibility gap.

### Technology Landscape — Cross-distro platform scan

Established pattern: source `/etc/os-release`, map `ID`/`ID_LIKE` → family →
manager — apt (debian/ubuntu), dnf/yum (rhel/fedora/rocky/alma/centos), pacman
(arch), zypper (suse), apk (alpine), emerge (gentoo), nix-env (nixos). Kernel-up
update = `apt-get dist-upgrade` / `dnf upgrade --refresh` / `pacman -Syu` /
`zypper update` / `apk -U upgrade`. Non-interactive flags differ per manager; sudo
only when not root. The repo's `PREAMBLE` already detects `$PM` and defines
`pkg_install`, but has **no upgrade path** and no plan/dry-run.

### Feasibility Assessment

Feasible incrementally: `inspect_target`/`plan_clone`/`apply_clone`/`verify_clone`,
local+SSH transport, component model and `PREAMBLE` already exist. The missing
pieces are (1) an OS upgrade *plan*, (2) a single guided entry point, and (3)
version capture. No new runtime, no control plane.

## Strategic Pillars

### Pillar 1: One guided entry point ("bootstrap")

**Rationale:** The vision's core is *minimum commands*; today the user must chain
`inspect_target → plan_clone → apply_clone → verify_clone` and know component ids.
**Vision Trace:** I-001, I-005.
**Key Research Finding:** the value in this category is UX + idempotency + verify,
not the install itself.
**Expected Impact:** ≤ 3 commands; `help` removes the need to read source.

### Pillar 2: Explicit, dry-run-first platform scan

**Rationale:** "scan from the kernel up" must be safe and legible; destructive
upgrades are the top reported failure mode.
**Vision Trace:** I-002.
**Key Research Finding:** cross-distro scripts universally expose `--dry-run` and
non-interactive flags per manager; rolling distros warn against `--noconfirm`.
**Expected Impact:** ≥ 90% detected-package coverage reported; zero surprise reboots.

### Pillar 3: Latest-stable OpenCode with captured pin

**Rationale:** "latest stable" conflicts with the constitution's reproducibility
principle unless the resolved version is recorded.
**Vision Trace:** I-003.
**Key Research Finding:** install script takes `--version`; `opencode --version`
reports the resolved build.
**Expected Impact:** 100% of provisions record the installed OpenCode version.

### Pillar 4: VDD-first config parity + independent verify

**Rationale:** provisioning is only done when config matches the repo; verify is
the gate.
**Vision Trace:** I-004.
**Key Research Finding:** existing `verify_clone` already re-checks config,
env template and components.
**Expected Impact:** 100% post-apply parity; verify always runs last.

### Pillar 5: Secret-value-free by construction

**Rationale:** a provisioner that touches many hosts must never move credentials.
**Vision Trace:** I-004 (constraint), constitution §Security.
**Key Research Finding:** `apply_clone` already writes an empty `~/.env.workbench`
(mode 600) listing only `{env:VAR}` names.
**Expected Impact:** zero secret values stored, transmitted, or logged.

## Competitive Analysis

| Competitor | Strengths | Weaknesses | Our Differentiator |
|------------|-----------|-----------|-------------------|
| Ansible / Chef / Puppet | Mature, idempotent, inventory | Control node, steep, OS-upgrade not the point | MCP-native, no control node, agent-pushable |
| cloud-init | First-boot automation | Boot-time only, cloud-specific | Works on any running box, local or SSH |
| Devcontainers / DevPod | Isolated, reproducible | Container, not the bare host | Provisions the host itself |
| chezmoi / dotbot / stow | Great for dotfiles | Config only, no platform scan | Platform scan + OpenCode + VDD config |
| Nix / home-manager | Fully declarative | Whole-system, steep, immutable-OS only | Works on conventional distros |
| devbox / mise | Toolchain pinning | No OS layer, no config parity | End-to-end: OS → OpenCode → VDD config |

## Risk Register

| Risk ID | Description | Likelihood | Impact | Mitigation |
|---------|-------------|-----------|--------|-----------|
| R-001 | OS/kernel upgrade breaks a running host | Medium | High | Dry-run plan by default; `upgrade` opt-in; non-interactive only on supported managers; no unattended reboot in scope |
| R-002 | Distro/manager not covered (immutable, Gentoo, NixOS) | Medium | Medium | Report `packageManager: null` + warning, no crash; degrade to component-only provisioning |
| R-003 | "latest stable" drifts from reproducible pin | High | Medium | Capture `opencode --version` at provision; expose `opencodeVersion` override |
| R-004 | Secret leakage to remote host | Low | High | Never read/transmit values; empty template only; gitleaks gate |
| R-005 | Command minimization removes the verify gate | Medium | High | `bootstrap` always calls verify; `help` is read-only |
| R-006 | Upstream install script/channel changes | Medium | Medium | Record resolved version + method; fall back npm `opencode-ai` |
| R-007 | Reboot required after kernel update | Medium | Medium | Plan includes reboot advisory; execution does not auto-reboot |

## S&T Assumptions (Strategy → Tactics)

**Necessity:** Tactics must audit the existing server (`components.ts`,
`clone.ts`, `tools.ts`), identify exactly what is missing versus the vision, and
sequence the change without breaking the current tool contract.

**Achievability:** the component model and transport already exist; adding a
platform-plan module and one orchestrating tool is contained.

**Sufficiency:** adding plan + one entry point + version capture + verify reaches
the Must-have ACs; OS upgrade execution is an opt-in Should.

**Warnings:** do not regress the existing tools; keep `apply_clone` intact; the
upgrade path must remain dry-run-first.

## Out of Scope (Strategic)

- Windows/macOS targets.
- Generic multi-tool configuration management (Ansible-class).
- Secret provisioning or value transport.
- Unattended kernel/OS reboots.
- Immutable-OS families (NixOS, Flatcar, Talos) as first-class targets.
