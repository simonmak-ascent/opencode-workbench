/**
 * A single shell script that inspects a Linux target and prints one JSON object.
 * Kept dependency-free (no jq/python required) so it runs on a bare machine.
 *
 * NOTE: this is a `String.raw` literal, which still interpolates `${...}` in JS.
 * The script therefore avoids `${...}` entirely and uses plain `$VAR` forms.
 */
export const PROBE_SCRIPT = String.raw`
have() { command -v "$1" >/dev/null 2>&1 && printf 'true' || printf 'false'; }
val()  { printf '%s' "$*" | tr -d '\r' | tr -d '"' | head -c 200; }

HOME_DIR="$HOME"
if [ -z "$HOME_DIR" ]; then
  HOME_DIR="$(getent passwd "$(id -un)" 2>/dev/null | cut -d: -f6)"
fi
[ -n "$HOME_DIR" ] || HOME_DIR=/root
USER_NAME="$(id -un)"
SHELL_NAME="$SHELL"

OS_ID=""; OS_ID_LIKE=""; OS_NAME=""; OS_VERSION=""
if [ -r /etc/os-release ]; then
  . /etc/os-release 2>/dev/null || true
  OS_ID="$ID"; OS_ID_LIKE="$ID_LIKE"; OS_NAME="$NAME"; OS_VERSION="$VERSION_ID"
fi
KERNEL="$(uname -sr 2>/dev/null || echo unknown)"
ARCH="$(uname -m 2>/dev/null || echo unknown)"

PM="none"
for c in apt-get dnf yum apk pacman zypper; do
  if command -v "$c" >/dev/null 2>&1; then PM="$c"; break; fi
done

NODE_VER="$(node --version 2>/dev/null || echo '')"
NPM_PREFIX="$(npm prefix -g 2>/dev/null || echo '')"
NPM_MODULES=""
if [ -n "$NPM_PREFIX" ]; then NPM_MODULES="$NPM_PREFIX/lib/node_modules"; fi
if [ -z "$NPM_MODULES" ]; then
  NPM_MODULES="$(npm root -g 2>/dev/null || echo '')"
fi

OPENCODE_BIN="$(command -v opencode 2>/dev/null || echo '')"
DOCKER_OK="false"
if command -v docker >/dev/null 2>&1; then
  docker info >/dev/null 2>&1 && DOCKER_OK="true" || DOCKER_OK="false"
fi

# Names of credentials present on the target (never values). Source the env
# template if it exists so freshly-filled keys are detected.
ENVFILE="$HOME_DIR/.env.workbench"
if [ -f "$ENVFILE" ]; then
  set -a
  . "$ENVFILE" >/dev/null 2>&1 || true
  set +a
fi
ENV_PRESENT=""
for v in DEEPSEEK_API_KEY OPENCODE_API_KEY OPENROUTER_API_KEY MOONSHOT_API_KEY \
         PERPLEXITY_API_KEY BRAVE_API_KEY SENTRY_AUTH_TOKEN FIRECRAWL_API_KEY \
         EXA_API_KEY CLOUDFLARE_API_TOKEN STRIPE_SECRET_KEY GITHUB_PERSONAL_ACCESS_TOKEN \
         SIMONPLMAK_CLOUD_PAT DATABASE_URL DATABASE_URI SURREAL_ENDPOINT AZURE_CLIENT_ID \
         GOOGLE_CLIENT_ID GOOGLE_CLIENT_SECRET ALIBABA_CLOUD_ACCESS_KEY_ID \
         ALIBABA_CLOUD_ACCESS_KEY_SECRET FRED_API_KEY COMPANIES_HOUSE_API_KEY \
         RESEARCH_CONTACT VERCEL_ACCESS_TOKEN; do
  if printenv "$v" >/dev/null 2>&1; then ENV_PRESENT="$ENV_PRESENT $v"; fi
done

cat <<EOF
{
  "user": "$(val "$USER_NAME")",
  "home": "$(val "$HOME_DIR")",
  "shell": "$(val "$SHELL_NAME")",
  "osId": "$(val "$OS_ID")",
  "osIdLike": "$(val "$OS_ID_LIKE")",
  "osName": "$(val "$OS_NAME")",
  "osVersion": "$(val "$OS_VERSION")",
  "kernel": "$(val "$KERNEL")",
  "arch": "$(val "$ARCH")",
  "packageManager": "$(val "$PM")",
  "nodeVersion": "$(val "$NODE_VER")",
  "npmPrefix": "$(val "$NPM_PREFIX")",
  "npmModules": "$(val "$NPM_MODULES")",
  "opencodeBin": "$(val "$OPENCODE_BIN")",
  "dockerRunning": $DOCKER_OK,
  "envPresent": "$ENV_PRESENT",
  "has": {
    "git": $(have git),
    "curl": $(have curl),
    "node": $(have node),
    "npm": $(have npm),
    "corepack": $(have corepack),
    "pnpm": $(have pnpm),
    "docker": $(have docker),
    "uv": $(have uv),
    "gh": $(have gh),
    "opencode": $(have opencode),
    "sudo": $(have sudo)
  }
}
EOF
`;
