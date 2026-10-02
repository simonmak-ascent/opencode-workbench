# Review skills installed — 2026-09-21

15 review skills were researched on GitHub, licence-checked, and installed into
`~/.config/opencode/skills/` so they are available in every repo and session.
They were used for the [webapp benchmark](./README.md) in this directory.

## Licences — why only these two sources

| Source | Licence | Verdict |
|---|---|---|
| `obra/superpowers` | **MIT** (Jesse Vincent) | Vendored — 10 skills |
| `Jeffallan/claude-skills` | **MIT** | Vendored — 5 skills |
| `JetBrains/skills` (129 skills) | **none** — GitHub licence API returns 404 | **Reference only** — read during review, no files copied. Default copyright applies. |
| `anthropics/skills` (19 skills) | **none** — 404 | **Reference only** — same reasoning. |

Both unlicensed collections are excellent but cannot be redistributed without an
explicit grant, so they were consulted rather than installed. Revisit if either
adds a licence.

## Installed

### Review process — `obra/superpowers` (MIT)

| Skill | Use |
|---|---|
| `requesting-code-review` | Commission a review with precisely-scoped context |
| `receiving-code-review` | Handle review feedback without defensiveness or churn |
| `verification-before-completion` | Prove work is done before claiming it is |
| `systematic-debugging` | Structured root-cause process instead of guessing |
| `test-driven-development` | Red/green discipline |
| `subagent-driven-development` | Delegate isolated work to sub-agents |
| `writing-plans` | Write an executable plan before coding |
| `executing-plans` | Work a plan to completion with checkpoints |
| `dispatching-parallel-agents` | Fan out independent work safely |
| `brainstorming` | Divergent design exploration before committing |

### Review specialists — `Jeffallan/claude-skills` (MIT)

| Skill | Use |
|---|---|
| `code-reviewer` | Diffs/files → bugs, security, smells, prioritised report |
| `architecture-designer` | System design and decomposition review |
| `security-reviewer` | Security-focused review pass |
| `secure-code-guardian` | Hardening guidance at the code level |
| `api-designer` | API shape, contracts, versioning |

## Deliberately not installed

- `microservices-architect`, `cloud-architect`, `rag-architect`, `graphql-architect`,
  `java-architect`, `angular-architect` — wrong shape for a Next.js/Vite webapp fleet.
- `subagent-driven-development` was kept despite its size (32 KB) because the
  supervisor workflow already dispatches to agents.
- Anthropic's `frontend-design` and `webapp-testing` overlap the existing
  `frontend-design` / `test-writer` skills and are unlicensed, so they were skipped.

## Overlap with existing skills

The fleet already had 50 global skills covering much of this space
(`architecture-review`, `security-audit`, `perf-optimizer`, `test-writer`,
`codebase-explorer`, `web-design-guidelines`, `accessibility-compliance`,
`dependency-audit`, `error-handling`). The genuine gaps these 15 fill are
**review-as-a-process** (how to commission, receive and verify a review) and
**named architecture/design specialists** — not generic capability.

## Re-checking later

```bash
ls ~/.config/opencode/skills/                       # installed
gh api repos/JetBrains/skills --jq .license.spdx_id # has it gained a licence?
```
