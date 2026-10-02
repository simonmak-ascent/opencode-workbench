# Self-Test

**Purpose:** Verify a cloned/deployed workbench actually works — not just that files exist.

**When To Use:** After `apply_clone` on a target, after a Vercel deployment, or when diagnosing a box.

---

Run the harness on the box (never locally — use `cs`):

```bash
cs best
cs run "bash scripts/selftest/run-selftest.sh"
# or a single class
cs run "bash scripts/selftest/run-selftest.sh --scope remote"
# machine-readable
cs run "bash scripts/selftest/run-selftest.sh --json"
```

Scopes: `providers` (model providers with the target's keys), `mcp` (every enabled MCP answers `initialize` + `tools/list`), `skills` (SKILL.md frontmatter), `tools` (CLIs on PATH), `infra` (pg-memory/browserless), `remote` (hosted workbench + primary-sources + vdd endpoints).

Result legend: `PASS` works, `WARN` degraded/optional, `FAIL` broken (exit 1), `SKIP` missing credential (expected when a key is not configured — ties to the Zen-floor degraded mode).

A JSON report is written to `selftest-report.json` (or `$WB_SELFTEST_REPORT`). The harness never reads or prints secret values; it checks only whether env vars are set and reports HTTP status codes.
