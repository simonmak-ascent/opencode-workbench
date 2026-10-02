# Data Model

Status: Active
Version: 1.0
Last updated: 2026-10-03

> Impact Chain: V-001 → S-002 → T-003 → SP-004 → PL-005

## Spec Reference

Implements: `vdd/specs/bootstrap-bare-host/spec.md`

> There is no database. This file models the **in-memory value objects** passed
> across the tool boundary (all Zod-validated), not persisted tables.

## Entities

### PlatformInfo
| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| osId | string \| null | from `/etc/os-release` `ID` | Distro identifier |
| osIdLike | string[] | from `ID_LIKE` | Family hints |
| osName | string \| null | `NAME` | Human-readable |
| osVersion | string \| null | `VERSION_ID` | Version |
| kernel | string \| null | `uname -sr` | Kernel |
| arch | string \| null | `uname -m` | CPU arch |
| packageManager | enum \| null | apt-get,dnf,yum,apk,pacman,zypper | Detected manager |
| family | enum | debian,rhel,arch,suse,alpine,unknown | Manager family |

### UpgradePlan
| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| packageManager | enum \| null | matches PlatformInfo | Manager used |
| commands | string[] | ordered | update then upgrade (non-interactive when assumeYes) |
| upgradable | number \| null | ≥0 or null | Count where parseable (apt) |
| executed | boolean | default false | True only when `upgrade:true` ran them |
| output | string[] | optional | Captured command output when executed |
| rebootAdvisory | boolean | default false | Kernel/reboot may be required |

### OpenCodeInstall
| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| installed | boolean | | Ran an install this call |
| version | string \| null | from `opencode --version` | Resolved build (the pin) |
| requested | string \| null | optional override | Value of `opencodeVersion` |

### BootstrapResult
| Field | Type | Description |
|-------|------|-------------|
| target | string | Target label (`local` or `ssh user@host`) |
| platform | PlatformInfo | OS/kernel/manager report |
| upgrade | UpgradePlan | Dry-run plan (executed=false unless requested) |
| opencode | OpenCodeInstall | Version pin |
| apply | ApplyResult | From existing engine |
| verify | VerifyResult | From existing engine |
| warnings | string[] | Degradation notes (e.g. unsupported manager) |

### Relationships
- `BootstrapResult` has one `PlatformInfo`, one `UpgradePlan`,
  one `OpenCodeInstall`, one `ApplyResult`, one `VerifyResult`.
- `UpgradePlan.packageManager` is derived from `PlatformInfo.packageManager`.

## Indexes

Not applicable (no persistence).

## Migrations

Not applicable. Schema evolution is via Zod field additions (backward-compatible).
