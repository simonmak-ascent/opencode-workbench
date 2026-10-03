/**
 * The portable Workbench profile: the ordered set of components that turn a
 * generic Linux machine into an OpenCode workbench. Each component knows how to
 * detect whether it is already satisfied and how to install itself idempotently.
 *
 * Tiers:
 *  - required : the clone cannot function without it
 *  - core     : part of the default portable profile
 *  - optional : opt-in add-ons (org-specific MCPs, Docker, data tooling)
 */

export type Tier = "required" | "core" | "optional";

export interface Component {
  id: string;
  title: string;
  tier: Tier;
  description: string;
  /** Exit 0 when the component is already present. */
  detect: string;
  /** Idempotent install script. */
  install: string;
  /** Human-readable preview of the privileged action, shown before consent. */
  preview?: string;
  /** True when a step cannot be fully automated (OAuth, reboot, ...). */
  manual?: boolean;
}

/**
 * Shared shell preamble: defines the target home, package manager and `$SUDO`.
 * `WB_REPO` (workspace path on the target) is exported by the apply tool.
 *
 * NOTE: `String.raw` still interpolates `${...}`, so this avoids `${...}`
 * entirely and relies on plain `$VAR` forms (no `set -u`).
 */
export const PREAMBLE = String.raw`
WB_HOME="$HOME"
SUDO=""
if [ "$(id -u)" -ne 0 ] && command -v sudo >/dev/null 2>&1; then SUDO="sudo"; fi
PM=""
for c in apt-get dnf yum apk pacman zypper; do
  if command -v "$c" >/dev/null 2>&1; then PM="$c"; break; fi
done
pkg_install() {
  case "$PM" in
    apt-get) $SUDO apt-get update -y && $SUDO apt-get install -y "$@" ;;
    dnf)     $SUDO dnf install -y "$@" ;;
    yum)     $SUDO yum install -y "$@" ;;
    apk)     $SUDO apk add --no-cache "$@" ;;
    pacman)  $SUDO pacman -Sy --noconfirm "$@" ;;
    zypper)  $SUDO zypper --non-interactive install "$@" ;;
    *)       echo "no supported package manager (need: $*)"; return 1 ;;
  esac
}
ok()   { echo "[workbench] $*"; }
warn() { echo "[workbench][warn] $*" >&2; }
`;

/** npm-global MCP servers that are portable and part of the default profile. */
export const CORE_NPM_MCPS = [
  "@modelcontextprotocol/server-brave-search",
  "@modelcontextprotocol/server-postgres",
  "@playwright/mcp",
  "@sentry/mcp-server",
  "mcp-mermaid",
  "mcp-echarts",
  "@jpisnice/shadcn-ui-mcp-server",
  "swagger-testcase-mcp",
  "mcp-design-system-extractor",
] as const;

/** Vendored MCPs shipped in `vendor/` that must be built on the target. */
export const VENDORED_MCPS = ["perplexity-agent-mcp", "browserless-mcp"] as const;

const npmMacpsInstall = CORE_NPM_MCPS.map((p) => `  npm install -g --silent ${p} || warn "failed: ${p}"`).join("\n");

export const COMPONENTS: Component[] = [
  {
    id: "git",
    title: "Git",
    tier: "required",
    description: "Version control; used to fetch the profile and the vendored MCPs.",
    detect: "command -v git >/dev/null 2>&1",
    install: `command -v git >/dev/null 2>&1 || pkg_install git`,
  },
  {
    id: "curl",
    title: "curl",
    tier: "required",
    description: "HTTP client used by the OpenCode installer and NodeSource setup.",
    detect: "command -v curl >/dev/null 2>&1",
    install: `command -v curl >/dev/null 2>&1 || pkg_install curl ca-certificates`,
  },
  {
    id: "node",
    title: "Node.js >= 20",
    tier: "required",
    description: "Runtime for OpenCode and all npm-based MCP servers.",
    preview: "curl NodeSource setup_22.x | sudo bash; apt/dnf/yum install nodejs (or nvm install 22)",
    detect: `command -v node >/dev/null 2>&1 && node -e 'process.exit(process.versions.node.split(".")[0] >= 20 ? 0 : 1)'`,
    install: `
if command -v apt-get >/dev/null 2>&1; then
  curl -fsSL https://deb.nodesource.com/setup_22.x | $SUDO bash - && $SUDO apt-get install -y nodejs
elif command -v dnf >/dev/null 2>&1; then
  curl -fsSL https://rpm.nodesource.com/setup_22.x | $SUDO bash - && $SUDO dnf install -y nodejs
elif command -v yum >/dev/null 2>&1; then
  curl -fsSL https://rpm.nodesource.com/setup_22.x | $SUDO bash - && $SUDO yum install -y nodejs
else
  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
  export NVM_DIR="$WB_HOME/.nvm"; [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
  nvm install 22 && nvm alias default 22
fi
`,
  },
  {
    id: "pnpm",
    title: "pnpm (via corepack)",
    tier: "core",
    description: "Package manager used across workbench projects.",
    detect: "command -v pnpm >/dev/null 2>&1 || (command -v corepack >/dev/null 2>&1 && corepack pnpm --version >/dev/null 2>&1)",
    install: `command -v corepack >/dev/null 2>&1 && corepack enable && corepack prepare pnpm@latest --activate || npm install -g pnpm`,
  },
  {
    id: "opencode",
    title: "OpenCode CLI",
    tier: "required",
    description: "The agent CLI this workbench is built around.",
    preview: "curl -fsSL https://opencode.ai/install | bash",
    detect: `command -v opencode >/dev/null 2>&1 || [ -x "$WB_HOME/.opencode/bin/opencode" ]`,
    install: `curl -fsSL https://opencode.ai/install | bash`,
  },
  {
    id: "uv",
    title: "uv",
    tier: "core",
    description: "Python tool runner used by several MCP servers (alibaba-cloud-ops, paper-search).",
    detect: `command -v uv >/dev/null 2>&1 || [ -x "$WB_HOME/.local/bin/uv" ]`,
    install: `curl -LsSf https://astral.sh/uv/install.sh | sh`,
  },
  {
    id: "research-mcps",
    title: "Research MCP servers",
    tier: "core",
    description: "primary-sources (npm) plus arxiv/paper-search/firecrawl (fetched on demand via uvx/npx).",
    detect: `command -v npx >/dev/null 2>&1 && command -v uvx >/dev/null 2>&1 && npm ls -g --depth=0 @simonmak-ascent/primary-sources-mcp >/dev/null 2>&1`,
    install: `command -v npx >/dev/null 2>&1 || { warn "npx missing"; exit 1; }
npm install -g --silent --no-audit --no-fund @simonmak-ascent/primary-sources-mcp@1.0.0 || warn "failed: primary-sources-mcp"`,
  },
  {
    id: "gh",
    title: "GitHub CLI",
    tier: "core",
    description: "Used for GitHub auth and repo operations.",
    detect: "command -v gh >/dev/null 2>&1",
    install: `
if command -v apt-get >/dev/null 2>&1; then
  $SUDO mkdir -p -m 755 /etc/apt/keyrings
  curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | $SUDO tee /etc/apt/keyrings/githubcli-archive-keyring.gpg >/dev/null
  $SUDO chmod go+r /etc/apt/keyrings/githubcli-archive-keyring.gpg
  echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | $SUDO tee /etc/apt/sources.list.d/github-cli.list >/dev/null
  $SUDO apt-get update -y && $SUDO apt-get install -y gh
else
  pkg_install gh
fi
`,
  },
  {
    id: "npm-mcps",
    title: "Core npm-global MCP servers",
    tier: "core",
    description: `${CORE_NPM_MCPS.length} portable MCP servers installed globally.`,
    detect: `npm ls -g --depth=0 @playwright/mcp >/dev/null 2>&1 && npm ls -g --depth=0 mcp-echarts >/dev/null 2>&1`,
    install: `command -v npm >/dev/null 2>&1 || { warn "npm missing"; exit 1; }
${npmMacpsInstall}`,
  },
  {
    id: "vendored-mcps",
    title: "Vendored MCP servers",
    tier: "core",
    description: "perplexity-agent-mcp and browserless-mcp, copied from the profile repo and built.",
    detect: `[ -f "$WB_HOME/.local/bin/perplexity-agent-mcp/index.js" ] && [ -f "$WB_HOME/.local/bin/browserless-mcp/dist/index.js" ]`,
    install: `
[ -n "$WB_REPO" ] || { warn "WB_REPO not set"; exit 1; }
mkdir -p "$WB_HOME/.local/bin"
for m in ${VENDORED_MCPS.join(" ")}; do
  if [ -d "$WB_REPO/vendor/$m" ]; then
    rm -rf "$WB_HOME/.local/bin/$m"
    cp -r "$WB_REPO/vendor/$m" "$WB_HOME/.local/bin/$m"
    ( cd "$WB_HOME/.local/bin/$m" && npm install --silent --no-audit --no-fund \
        && (npm run build >/dev/null 2>&1 || true) ) || warn "build failed: $m"
  else
    warn "vendor/$m not found in $WB_REPO"
  fi
done
`,
  },
  {
    id: "github-mcp",
    title: "github-mcp-server (binary)",
    tier: "optional",
    description: "GitHub MCP server Go binary. Falls back to the remote GitHub MCP if unavailable.",
    detect: `[ -x "$WB_HOME/.local/bin/github-mcp-server" ]`,
    install: `
[ -n "$WB_REPO" ] || true
mkdir -p "$WB_HOME/.local/bin"
ARCH="$(uname -m)"
case "$ARCH" in
  x86_64|amd64) GA="amd64" ;;
  aarch64|arm64) GA="arm64" ;;
  *) warn "unsupported arch $ARCH for github-mcp-server"; exit 0 ;;
esac
OS="$(uname -s | tr '[:upper:]' '[:lower:]')"
URL="$(curl -fsSL https://api.github.com/repos/github/github-mcp-server/releases/latest \
  | grep -o "https://[^\\"]*$OS-$GA\\.tar\\.gz" | head -n1 || true)"
if [ -n "$URL" ]; then
  TMP="$(mktemp -d)"; curl -fsSL "$URL" -o "$TMP/gh.tar.gz" \
    && tar -xzf "$TMP/gh.tar.gz" -C "$TMP" \
    && find "$TMP" -name 'github-mcp-server' -type f -exec cp {} "$WB_HOME/.local/bin/github-mcp-server" \\; \
    && chmod +x "$WB_HOME/.local/bin/github-mcp-server"
  rm -rf "$TMP"
else
  warn "could not resolve github-mcp-server release URL"
fi
`,
  },
  {
    id: "skills",
    title: "Agent skills",
    tier: "core",
    description: "Copies the profile's .opencode/skills into ~/.config/opencode/skills.",
    detect: `[ -d "$WB_HOME/.config/opencode/skills" ] && [ "$(find "$WB_HOME/.config/opencode/skills" -name SKILL.md 2>/dev/null | wc -l)" -gt 0 ]`,
    install: `
[ -n "$WB_REPO" ] || { warn "WB_REPO not set"; exit 1; }
mkdir -p "$WB_HOME/.config/opencode/skills"
if [ -d "$WB_REPO/.opencode/skills" ]; then
  cp -r "$WB_REPO/.opencode/skills/." "$WB_HOME/.config/opencode/skills/"
  ok "skills copied: $(find "$WB_HOME/.config/opencode/skills" -name SKILL.md | wc -l)"
else
  warn "no .opencode/skills in $WB_REPO"
fi
`,
  },
  {
    id: "plugins",
    title: "OpenCode plugins",
    tier: "core",
    description: "memory + doc-tools plugins referenced by opencode.json.",
    detect: `[ -f "$WB_HOME/.config/opencode/plugins/memory.ts" ] && [ -f "$WB_HOME/.config/opencode/plugins/doc-tools.ts" ]`,
    install: `
[ -n "$WB_REPO" ] || { warn "WB_REPO not set"; exit 1; }
mkdir -p "$WB_HOME/.config/opencode/plugins"
if [ -d "$WB_REPO/plugins" ]; then
  cp -r "$WB_REPO/plugins/." "$WB_HOME/.config/opencode/plugins/"
  ok "plugins copied"
elif [ -d "$WB_REPO/.opencode/plugins" ]; then
  cp -r "$WB_REPO/.opencode/plugins/." "$WB_HOME/.config/opencode/plugins/"
  ok "plugins copied"
else
  warn "no plugins/ in $WB_REPO (memory.ts/doc-tools.ts missing from config)"
fi
`,
  },
  {
    id: "docker",
    title: "Docker",
    tier: "optional",
    description: "Required only for the pg-memory and browserless containers.",
    preview: "curl -fsSL https://get.docker.com | sudo sh",
    detect: "command -v docker >/dev/null 2>&1 && docker info >/dev/null 2>&1",
    install: `command -v docker >/dev/null 2>&1 || curl -fsSL https://get.docker.com | $SUDO sh`,
  },
  {
    id: "docker-containers",
    title: "Docker containers (pg-memory, browserless)",
    tier: "optional",
    description: "PostgreSQL 16 on :5432 and Browserless Chromium on :3000.",
    detect: `command -v docker >/dev/null 2>&1 && docker ps --format '{{.Names}}' 2>/dev/null | grep -q '^pg-memory$' && docker ps --format '{{.Names}}' 2>/dev/null | grep -q '^browserless$'`,
    install: `
command -v docker >/dev/null 2>&1 || { warn "docker missing"; exit 1; }
docker rm -f pg-memory >/dev/null 2>&1 || true
docker run -d --name pg-memory --restart unless-stopped \
  -e POSTGRES_USER=opencode -e POSTGRES_PASSWORD=opencode -e POSTGRES_DB=memory \
  -p 5432:5432 postgres:16-alpine >/dev/null && ok "pg-memory up"
if [ -n "\${BROWSERLESS_TOKEN:-}" ]; then
  docker rm -f browserless >/dev/null 2>&1 || true
  docker run -d --name browserless --restart unless-stopped \
    -e "TOKEN=\${BROWSERLESS_TOKEN}" -p 3000:3000 ghcr.io/browserless/chromium >/dev/null && ok "browserless up"
else
  warn "BROWSERLESS_TOKEN unset — skipping browserless"
fi
`,
  },
  {
    id: "playwright-browsers",
    title: "Playwright Chromium",
    tier: "core",
    description: "Browser binaries for the Playwright MCP.",
    detect: `ls "$WB_HOME/.cache/ms-playwright" >/dev/null 2>&1`,
    install: `npx --yes playwright install chromium || warn "playwright install failed"`,
    manual: true,
  },
  {
    id: "data-tools",
    title: "Data / ETL CLI tools",
    tier: "optional",
    description: "pandoc, jq, miller, sqlite3 and Python data libraries.",
    detect: "command -v jq >/dev/null 2>&1 && command -v pandoc >/dev/null 2>&1",
    install: `
pkg_install jq pandoc sqlite3 xmlstarlet || true
pipx install csvkit 2>/dev/null || true
pip3 install --break-system-packages -q duckdb polars datasette pyarrow openpyxl xlrd xlsxwriter lxml sqlalchemy tabulate 2>/dev/null || true
`,
  },
  {
    id: "scientific",
    title: "Scientific Python stack",
    tier: "optional",
    description: "numpy, scipy, pandas, matplotlib, sympy (plus optional Jupyter, R, Julia).",
    preview: "pip3 install --break-system-packages numpy scipy pandas matplotlib sympy",
    detect: `python3 -c 'import numpy, scipy, pandas, matplotlib, sympy' >/dev/null 2>&1`,
    install: `command -v python3 >/dev/null 2>&1 || pkg_install python3 python3-pip
pip3 install --break-system-packages -q numpy scipy pandas matplotlib sympy || warn "scientific install failed"`,
  },
  {
    id: "db-clients",
    title: "Database clients",
    tier: "optional",
    description: "psql and pgcli for PostgreSQL work.",
    detect: "command -v psql >/dev/null 2>&1 || command -v pgcli >/dev/null 2>&1",
    install: `pkg_install postgresql-client || true
pipx install pgcli 2>/dev/null || true`,
  },
  {
    id: "sandbox",
    title: "OpenCode sandbox (bubblewrap)",
    tier: "optional",
    description:
      "Runs the OpenCode CLI in a bubblewrap sandbox: read-only system, writable workspace, and no access to ~/.ssh, cloud credentials or ~/.env.workbench.",
    preview: "install bubblewrap and ~/.local/bin/opencode-sandbox",
    detect: `command -v bwrap >/dev/null 2>&1 && [ -x "$WB_HOME/.local/bin/opencode-sandbox" ]`,
    install: `
command -v bwrap >/dev/null 2>&1 || pkg_install bubblewrap || true
command -v bwrap >/dev/null 2>&1 || { warn "bubblewrap unavailable (kernel may block unprivileged user namespaces)"; exit 1; }
if [ -z "\${WB_REPO:-}" ] || [ ! -f "$WB_REPO/scripts/sandbox/opencode-sandbox.sh" ]; then
  warn "sandbox script not found under WB_REPO"; exit 1
fi
mkdir -p "$WB_HOME/.local/bin"
install -m 0755 "$WB_REPO/scripts/sandbox/opencode-sandbox.sh" "$WB_HOME/.local/bin/opencode-sandbox"
ok "opencode-sandbox -> ~/.local/bin/opencode-sandbox"
`,
  },
];

export function componentById(id: string): Component | undefined {
  return COMPONENTS.find((c) => c.id === id);
}

/** Component ids included by default in a portable clone. */
export function defaultComponentIds(): string[] {
  return COMPONENTS.filter((c) => c.tier === "required" || c.tier === "core").map((c) => c.id);
}

/**
 * Bounded, idempotent uninstall scripts for the components whose removal is
 * automated. Components absent from this map cannot be removed automatically
 * (system packages such as git/curl/node) and are reported as `manual`.
 */
export const UNINSTALL_SCRIPTS: Record<string, string> = {
  pnpm: `command -v npm >/dev/null 2>&1 && npm rm -g pnpm >/dev/null 2>&1 || true`,
  opencode: `rm -rf "$WB_HOME/.opencode" "$WB_HOME/.local/bin/opencode"
command -v npm >/dev/null 2>&1 && npm rm -g opencode-ai >/dev/null 2>&1 || true`,
  uv: `rm -f "$WB_HOME/.local/bin/uv" "$WB_HOME/.local/bin/uvx"`,
  "research-mcps": `command -v npm >/dev/null 2>&1 && npm rm -g --silent @simonmak-ascent/primary-sources-mcp >/dev/null 2>&1 || true`,
  "npm-mcps": `command -v npm >/dev/null 2>&1 || { warn "npm missing"; exit 1; }
${CORE_NPM_MCPS.map((p) => `  npm rm -g --silent ${p} >/dev/null 2>&1 || true`).join("\n")}`,
  "vendored-mcps": `rm -rf "$WB_HOME/.local/bin/perplexity-agent-mcp" "$WB_HOME/.local/bin/browserless-mcp"`,
  "github-mcp": `rm -f "$WB_HOME/.local/bin/github-mcp-server"`,
  skills: `rm -rf "$WB_HOME/.config/opencode/skills"`,
  plugins: `rm -rf "$WB_HOME/.config/opencode/plugins"`,
  "docker-containers": `command -v docker >/dev/null 2>&1 || { warn "docker missing"; exit 1; }
docker rm -f pg-memory browserless >/dev/null 2>&1 || true`,
  "playwright-browsers": `rm -rf "$WB_HOME/.cache/ms-playwright"`,
  sandbox: `rm -f "$WB_HOME/.local/bin/opencode-sandbox"`,
};

/** Uninstall script for a component id, or undefined when removal is manual. */
export function uninstallScript(id: string): string | undefined {
  return UNINSTALL_SCRIPTS[id];
}
