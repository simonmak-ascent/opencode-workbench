# API Contract — `bootstrap_host`

Status: Active
Version: 1.0
Last updated: 2026-10-03

> Impact Chain: V-001 → S-002 → T-003 → SP-004 → PL-005

## MCP tool `bootstrap_host`

### Description

Provision a bare Linux target (local or SSH) into a VDD-configured OpenCode
workstation in one call: scan the platform from the kernel up, return a dry-run
upgrade plan, install the latest stable OpenCode and record its version, apply
the VDD profile, and verify. Pass `help: true` for parameter documentation
without contacting the target.

### Request (input schema)

```jsonc
{
  "target": {                 // required unless help:true
    "mode": "local" | "ssh",
    "host": "string?",         // required when mode=ssh
    "user": "string?",
    "port": "number?",
    "identityFile": "string?",
    "cwd": "string?"
  },
  "help": "boolean?",          // return docs only; no target access
  "workspace": "string?",      // target dir for the profile repo
  "components": "string[]?",   // default: required+core
  "upgrade": "boolean?",       // execute platform upgrade (default false)
  "assumeYes": "boolean?",     // non-interactive upgrade flags (default true)
  "opencodeVersion": "string?",// pin a specific version (default: latest stable)
  "dryRun": "boolean?"         // report only; make no changes
}
```

### Response — `help: true`

```json
{
  "name": "bootstrap_host",
  "description": "…",
  "parameters": [
    { "name": "target", "type": "object", "required": false, "description": "…" },
    { "name": "help", "type": "boolean", "required": false, "description": "…" }
  ]
}
```

### Response — normal

```json
{
  "target": "ssh deploy@box",
  "platform": { "osId": "ubuntu", "osIdLike": ["debian"], "kernel": "Linux 6.8", "arch": "x86_64", "packageManager": "apt-get", "family": "debian" },
  "upgrade": { "packageManager": "apt-get", "commands": ["apt-get update", "apt-get -y dist-upgrade"], "upgradable": 12, "executed": false, "output": [], "rebootAdvisory": false },
  "opencode": { "installed": true, "version": "1.0.180", "requested": null },
  "apply": { "target": "ssh deploy@box", "workspace": "…", "configPath": "…", "envPath": "…", "installed": [], "skipped": [], "envVars": [], "dryRun": false, "model": "…", "providerMode": "deepseek", "degraded": [] },
  "verify": { "target": "ssh deploy@box", "configExists": true, "envExists": true, "components": [], "missing": [] },
  "warnings": []
}
```

### Error cases

| Condition | Result |
|-----------|--------|
| `mode=ssh` without `host` | structured error `isError:true`, message names target validation |
| Unreachable target | structured error `isError:true`, message includes target label |
| Unsupported package manager | success with `platform.packageManager:null`, `warnings[]` populated, `upgrade.commands:[]` |

### AC Coverage

- AC-1: `help:true` returns the parameter list with no target access.
- AC-2: `platform` fields + `upgrade.commands` from detected manager.
- AC-3: `upgrade.executed=false` unless `upgrade:true`.
- AC-4: `opencode.version` populated from `opencode --version`.
- AC-5/AC-6: embedded `apply`/`verify` reflect parity and idempotency.
- AC-7: `envPath` is a names-only template; no secret values in any field.
- AC-E1/AC-E2: unsupported-manager and failure behavior above.
