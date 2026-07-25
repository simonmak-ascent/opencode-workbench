# Codespace Workbench

A pre-configured GitHub Codespaces workstation for AI-assisted development
with OpenCode and MCP servers.

The workbench provisions a Node.js environment with OpenCode, pnpm, Vercel
CLI, and a full suite of MCP servers installed globally — ready the moment
your Codespace boots.

## Purpose

- Eliminate manual setup on every new Codespace.
- Keep toolchain and MCP server versions in one place under version control.
- Provide shell aliases for common workflows across all Codespaces.

## Creating a Codespace

1. Navigate to the repository on GitHub:
   `https://github.com/simonplmak-cloud/codespace-workbench`

2. Click **Code** → **Codespaces** → **Create codespace on main**.

3. Wait for the post-creation script to finish (watch the terminal output).

4. The workbench is ready when you see `Workbench setup complete`.

## Adding MCP Servers

Edit `.devcontainer/setup-workbench.sh` and add the npm package name to the
`PACKAGES` array:

```bash
PACKAGES=(
  opencode-ai
  pnpm
  # ... existing entries ...
  @my-org/my-mcp-server    # <-- add new server here
)
```

Commit and push. The next Codespace rebuild will install it automatically.

## Rebuilding the Environment

If you modify `devcontainer.json`, `setup-workbench.sh`, or `aliases.sh`:

1. Open the Command Palette (`Ctrl+Shift+P` / `Cmd+Shift+P`).
2. Run **Codespaces: Rebuild Container**.

Alternatively, delete the existing Codespace and create a fresh one — the
post-creation script runs on every new Codespace.

## Verifying OpenCode

After the Codespace boots, open a terminal and run:

```bash
opencode --version
```

If the command is not found, rebuild the container or check the setup log at
`/workspaces/.codespaces/.postCreateCommand.log`.

## Cloning Other Repositories

All repositories live under `/workspaces/`. Use the `workspaces` alias to
jump there quickly:

```bash
workspaces
```

Then clone any repository:

```bash
git clone https://github.com/some-org/some-repo.git
```

## File Structure

```
.devcontainer/
├── devcontainer.json       # Codespace definition
├── setup-workbench.sh      # Post-creation provisioning
└── aliases.sh              # Shell shortcuts
```

## Requirements

- GitHub Codespaces (or any Dev Container-compatible host)
- Node.js 20+ (provided by the default Codespaces image)
