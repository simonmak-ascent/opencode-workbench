# Shell Configuration

> Purpose: Shell aliases, functions, and environment customizations for the workstation.
> Source: Sourced by ~/.bashrc during SWAS startup.

## Files

| File | Purpose |
|------|---------|
| `aliases.sh` | Shell aliases and helper functions |
| `README.md` | This file |

## Recovery

Shell configuration is applied by `.devcontainer/setup.sh` which appends a source line to `~/.bashrc`:

```bash
source /workspaces/workbench/configs/shell/aliases.sh
```

To reload after changes:
```bash
source ~/.bashrc
```
