# Contributing

## How to Contribute

1. **Open an issue** to discuss the change first. Most changes are to Markdown files.

2. **Identify the authoritative source** for the concept you're changing (see [AGENTS.md](AGENTS.md#file-roles--authoritative-sources)). Make changes to the canonical file first, then propagate to derived files.

3. **Keep counts consistent**: 108 gate checks, 24 anti-patterns, 7 domain primers must match across all files.

4. **Keep command tables consistent** across SKILL.md, README.md, and quick-reference.md.

5. **Submit a PR** with a clear description of what changed and why.

## Repository Conventions

- Phase numbering (0–8) is stable — never renumber
- Impact Chain headers use `V-`, `S-`, `T-`, `A-`, `SP-`, `PL-`, `TK-`, `I-`, `R-`, `AC-` prefixes
- Bi-directional gates each have: forward checks, backward checks, 4 S&T assumptions
- VDD must remain a superset of SDD — every SDD command and feature must have a VDD equivalent
- Anti-patterns: append to end of `references/anti-patterns.md`, do not renumber
- New domain primers: add to `domain-primers/` and update SKILL.md's Domain Primers table
- New reference docs: add to `references/` and update INDEX.md
- New commands: add to SKILL.md, README.md, and quick-reference.md
