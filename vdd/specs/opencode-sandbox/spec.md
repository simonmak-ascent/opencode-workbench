# Spec — opencode-sandbox

> Traces to: `vdd/vision.md` (security of the provisioned host), `vdd/tactics.md` A-012.
> Status: implemented (v3.1.0).

## User story

As an operator who lets an AI agent run shell commands on a workstation, I want the
OpenCode CLI to run inside an OS-level sandbox with a read-only system and no access to
my SSH keys, cloud credentials or secrets file, so that a compromised or misbehaving
agent cannot read or exfiltrate them.

## Boundaries

- **Always**
  - Refuse to run unsandboxed (fail closed) when `bwrap` is unavailable.
  - Mount the system read-only and expose only the workspace + OpenCode's own state dirs.
  - Keep `~/.ssh`, `~/.env.workbench`, `~/.aws`, `~/.config/gh` out of the sandbox.
- **Ask**
  - Nothing at runtime; installation is opt-in via the `sandbox` component.
- **Never**
  - Never run the agent as root inside the sandbox.
  - Never mount the whole home directory.

## Acceptance criteria

- **AC-1** Given `bwrap` is installed, when I run `opencode-sandbox run "..."`, then the
  command executes inside a bubblewrap namespace with `/usr` read-only.
- **AC-2** Given `~/.ssh` exists, when the sandbox runs, then `~/.ssh` is absent inside it.
- **AC-3** Given `bwrap` is missing, when I run `opencode-sandbox`, then it exits non-zero
  with install guidance and does not run `opencode`.
- **AC-4** Given `OPENCODE_SANDBOX_NO_NET=1`, when the sandbox runs, then the network is
  unshared.
- **AC-5** Given the `sandbox` component is installed, when `remove_component sandbox` runs,
  then `~/.local/bin/opencode-sandbox` is removed.

## Non-functional

- Portable across apt/dnf/apk/pacman/zypper hosts (via the shared `pkg_install` preamble).
- No root at run time (user namespaces); `sudo` only at install time.
- The wrapper is shell-only and has no network calls of its own.
