#!/usr/bin/env bash
#
# opencode-sandbox — run the OpenCode CLI inside a bubblewrap (bwrap) sandbox.
#
# Security goal: the agent process gets a read-only system, a writable copy of
# its workspace and OpenCode's own state directories, and NOTHING ELSE from your
# home. Your SSH keys (~/.ssh), cloud credentials (~/.aws, ~/.config/gcloud),
# GitHub tokens (~/.config/gh) and the secrets file ~/.env.workbench are not
# mounted, so a compromised or misbehaving agent cannot read them.
#
# Usage:
#   opencode-sandbox [args...]            # same args as `opencode`
#   opencode-sandbox run "..."            # e.g. `opencode run` in the sandbox
#
# Environment:
#   OPENCODE_SANDBOX_CWD=<dir>   working dir to expose read-write (default: $PWD)
#   OPENCODE_SANDBOX_NO_NET=1    isolate the network (default: network allowed,
#                                because model APIs are remote)
#   OPENCODE_SANDBOX_RW=<paths>  extra colon-separated paths to bind read-write
#   OPENCODE_SANDBOX_RO=<paths>  extra colon-separated paths to bind read-only
#   OPENCODE_SANDBOX_BIN=<path>  opencode binary (default: resolved via PATH)
#
# Requires: bubblewrap (`bwrap`). Install with e.g.
#   sudo apt-get install -y bubblewrap   # Debian/Ubuntu
#   sudo dnf install -y bubblewrap        # Fedora/RHEL
#
set -euo pipefail

if ! command -v bwrap >/dev/null 2>&1; then
  echo "opencode-sandbox: bubblewrap (bwrap) is required." >&2
  echo "  Debian/Ubuntu: sudo apt-get install -y bubblewrap" >&2
  echo "  Fedora/RHEL:   sudo dnf install -y bubblewrap" >&2
  echo "  Alpine:        sudo apk add bubblewrap" >&2
  echo "Refusing to run unsandboxed. Use 'opencode' directly if you accept that." >&2
  exit 127
fi

WORKDIR="${OPENCODE_SANDBOX_CWD:-$PWD}"
HOME_DIR="${HOME:-/root}"
OPENCODE_BIN="${OPENCODE_SANDBOX_BIN:-$(command -v opencode || true)}"

if [ -z "$OPENCODE_BIN" ]; then
  echo "opencode-sandbox: 'opencode' not found on PATH (set OPENCODE_SANDBOX_BIN)." >&2
  exit 127
fi

args=(
  --die-with-parent
  --new-session
  --unshare-pid
  --unshare-uts
  --unshare-ipc
  --proc /proc
  --dev /dev
  --tmpfs /tmp
)

# Read-only system.
for d in /usr /etc /bin /sbin /lib /lib64 /opt /run; do
  [ -e "$d" ] && args+=(--ro-bind "$d" "$d")
done

# Writable workspace.
[ -d "$WORKDIR" ] && args+=(--bind "$WORKDIR" "$WORKDIR")

# OpenCode's own state — writable, created if absent. These are the only parts
# of $HOME the sandbox sees.
for d in \
  "$HOME_DIR/.config/opencode" \
  "$HOME_DIR/.local/share/opencode" \
  "$HOME_DIR/.cache/opencode" \
  "$HOME_DIR/.local/state/opencode"; do
  mkdir -p "$d" 2>/dev/null || true
  [ -e "$d" ] && args+=(--bind "$d" "$d")
done

# Where the opencode binary itself may live (read-only).
for d in "$HOME_DIR/.opencode" "$HOME_DIR/.local/bin" "$HOME_DIR/.npm-global"; do
  [ -e "$d" ] && args+=(--ro-bind "$d" "$d")
done

# Caller-provided extra mounts (colon-separated path lists).
if [ -n "${OPENCODE_SANDBOX_RO:-}" ]; then
  IFS=':' read -r -a _ro <<<"$OPENCODE_SANDBOX_RO"
  for p in "${_ro[@]}"; do [ -e "$p" ] && args+=(--ro-bind "$p" "$p"); done
fi
if [ -n "${OPENCODE_SANDBOX_RW:-}" ]; then
  IFS=':' read -r -a _rw <<<"$OPENCODE_SANDBOX_RW"
  for p in "${_rw[@]}"; do [ -e "$p" ] && args+=(--bind "$p" "$p"); done
fi

# Network is allowed by default (remote model APIs); opt into isolation.
if [ "${OPENCODE_SANDBOX_NO_NET:-0}" = "1" ]; then
  args+=(--unshare-net)
fi

args+=(--setenv HOME "$HOME_DIR" --chdir "$WORKDIR")

exec bwrap "${args[@]}" -- "$OPENCODE_BIN" "$@"
