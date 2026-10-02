# TDQS baseline — opencode-workbench

> Evidence for spec `mcp-quality-and-registry` AC-1. Command run on the compute
> box (`wcag-workforce`) against the built server.

```
npx -y mcp-tdqs lint --command 'node mcp-server/dist/index.js' \
  --server-name opencode-workbench --format text
```

**Result (2026-10-03): 0 errors, 7 warnings, 0 notes · 9 tools · specification 1.3**

| Tool | Params | Coverage | Annotations | Output schema | Cost | Warning |
|------|--------|----------|-------------|---------------|------|---------|
| workbench_info | 0 | 100% | yes | yes | 0 | — |
| inspect_target | 1 | 100% | yes | yes | 4 | shadow-candidate (vs bootstrap_host) |
| plan_clone | 6 | 100% | yes | yes | 4 | shadow-candidate |
| apply_clone | 7 | 100% | yes | yes | 4 | shadow-candidate |
| verify_clone | 6 | 100% | yes | yes | 4 | shadow-candidate |
| install_component | 4 | 100% | yes | yes | 5 | shadow-candidate |
| list_required_credentials | 1 | 100% | yes | yes | 4 | shadow-candidate |
| run_auth_flow | 2 | 100% | yes | yes | 5 | shadow-candidate |
| bootstrap_host | 11 | 100% | yes | yes | 0 | — |

All warnings are the deterministic **shadow-candidate prefilter**: `bootstrap_host`
(cost 0) may shadow the granular tools. Only the full coherence evaluation (needs a
scorer key) can confirm or clear them; disambiguation text was added to all five
descriptions to address the underlying risk (AC-2).

## Full score (AC-3)

Blocked: `tdqs score` requires an OpenAI-compatible endpoint
(`TDQS_BASE_URL`/`TDQS_API_KEY`/`TDQS_MODEL`) or `--hosted` with a TDQS site key.
No scorer credential is held by the agent. Once one is provided:

```
TDQS_BASE_URL=<openai-compat> TDQS_API_KEY=<key> TDQS_MODEL=<id> \
  npx -y mcp-tdqs score --command 'node mcp-server/dist/index.js' --fail-under A
```
