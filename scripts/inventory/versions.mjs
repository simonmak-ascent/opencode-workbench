#!/usr/bin/env node
/**
 * versions.mjs — generate `workbench.versions.json`, the single recorded answer
 * to "what versions does this profile ship, and what is current?".
 *
 * The version truth used to be split three ways: `package.json` (the repo),
 * `opencode.json` (command strings) and `components.ts` (install scripts). For
 * the servers launched as `node /home/node/.npm-global/...` it was recorded
 * nowhere at all. This walks the profile, derives each server's package from its
 * entry path, and resolves the current version from the real upstream, so the
 * file is evidence rather than a claim.
 *
 * Deterministic: keys sorted, nothing time-dependent. CI regenerates and runs
 * `--check` to prove the committed file still matches reality.
 *
 * Usage: node scripts/inventory/versions.mjs [--check]
 */
import { createHash } from "node:crypto";
import { readFileSync, writeFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { join, relative, resolve, dirname, basename } from "node:path";
import { fileURLToPath } from "node:url";

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const OUT = join(REPO, "workbench.versions.json");

const OPENCODE_UPDATE_API = "https://opencode.ai/update/api/latest/cli/npm";
const NPM_REGISTRY = "https://registry.npmjs.org";
const PYPI = "https://pypi.org/pypi";
const GHCR = "https://ghcr.io";
const GITHUB_API = "https://api.github.com";

const TIMEOUT_MS = 20_000;
const ATTEMPTS = 3;

/** Fetch JSON with bounded retries; returns undefined on failure — a missing answer is recorded as null, never invented. */
async function getJson(url, headers = {}) {
  for (let attempt = 1; attempt <= ATTEMPTS; attempt++) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
    try {
      const res = await fetch(url, { headers, signal: ctrl.signal });
      if (res.ok) return await res.json();
      if (res.status === 404) return undefined;
    } catch {
      // fall through to retry
    } finally {
      clearTimeout(timer);
    }
    if (attempt < ATTEMPTS) await new Promise((r) => setTimeout(r, attempt * 1000));
  }
  return undefined;
}

async function npmLatest(name) {
  if (!name) return null;
  const data = await getJson(`${NPM_REGISTRY}/${name.replace("/", "%2f")}/latest`);
  return typeof data?.version === "string" ? data.version : null;
}

async function pypiLatest(name) {
  if (!name) return null;
  const data = await getJson(`${PYPI}/${name}/json`);
  return typeof data?.info?.version === "string" ? data.info.version : null;
}

async function githubLatestTag(slug) {
  const data = await getJson(`${GITHUB_API}/repos/${slug}/releases/latest`, {
    Accept: "application/vnd.github+json",
  });
  return typeof data?.tag_name === "string" ? data.tag_name : null;
}

/**
 * Resolve a container tag to its digest, so "latest" can be both current and
 * reproducible. GHCR only issues anonymous tokens for public images; a denial is
 * recorded as `resolution: "credentials-required"`, never as a fake digest.
 */
async function ociDigest(image, tag) {
  const [registry, ...rest] = image.split("/");
  const repository = rest.join("/");
  const tokenRes = await getJson(`${GHCR}/token?scope=repository:${repository}:pull&service=ghcr.io`);
  const token = tokenRes?.token;
  if (!token) return { digest: null, resolution: "credentials-required" };
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(`https://${registry}/v2/${repository}/manifests/${tag}`, {
      method: "HEAD",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept:
          "application/vnd.oci.image.index.v1+json, application/vnd.docker.distribution.manifest.list.v2+json, application/vnd.docker.distribution.manifest.v2+json",
      },
      signal: ctrl.signal,
    });
    const digest = res.headers.get("docker-content-digest");
    return digest ? { digest, resolution: "registry" } : { digest: null, resolution: "unresolved" };
  } catch {
    return { digest: null, resolution: "unresolved" };
  } finally {
    clearTimeout(timer);
  }
}

/** A pin of `latest` is not a pin. */
function normalisePin(pin) {
  return !pin || pin === "latest" ? null : pin;
}

/** `npx [-y] pkg[@ver]` → { package, pin } */
function parseNpx(cmd) {
  const arg = cmd.find((a, i) => i > 0 && !a.startsWith("-") && a !== "npx");
  if (!arg) return null;
  const at = arg.lastIndexOf("@");
  return at > 0
    ? { package: arg.slice(0, at), pin: normalisePin(arg.slice(at + 1)) }
    : { package: arg, pin: null };
}

/** `uvx [--with x==y] pkg[@ver]` → { package, pin } — the `--with` SDK pin is not the app version. */
function parseUvx(cmd) {
  const arg = cmd.find((a, i) => i > 0 && !a.startsWith("-") && a !== "uvx" && !/^[a-z-]+==/.test(a));
  if (!arg) return null;
  const at = arg.lastIndexOf("@");
  return at > 0
    ? { package: arg.slice(0, at), pin: normalisePin(arg.slice(at + 1)) }
    : { package: arg, pin: null };
}

/** `/…/node_modules/@scope/pkg/x.js` → `@scope/pkg` */
function packageFromPath(p) {
  const marker = "/node_modules/";
  const i = p.lastIndexOf(marker);
  if (i === -1) return null;
  const parts = p.slice(i + marker.length).split("/");
  if (parts[0]?.startsWith("@")) return parts[0] && parts[1] ? `${parts[0]}/${parts[1]}` : null;
  return parts[0] || null;
}

/** `ghcr.io/owner/img:tag` → { image, tag } */
function parseImage(ref) {
  const colon = ref.lastIndexOf(":");
  if (colon <= ref.lastIndexOf("/")) return { image: ref, tag: "latest" };
  return { image: ref.slice(0, colon), tag: ref.slice(colon + 1) };
}

function classify(entry) {
  if (entry.type === "remote" || entry.url) return "remote";
  const cmd = Array.isArray(entry.command) ? entry.command : [];
  if (cmd[0] === "npx") return "npx";
  if (cmd[0] === "uvx") return "uvx";
  if (cmd[0] === "docker") return "docker";
  if (cmd[0] === "node" || (cmd[0] && cmd[0].startsWith("/"))) {
    return packageFromPath(cmd[1] ?? cmd[0] ?? "") ? "npmGlobal" : "localFile";
  }
  return "unknown";
}

function sha256(buf) {
  return `sha256:${createHash("sha256").update(buf).digest("hex")}`;
}

/** Hash a tree: sorted relative paths + bytes, so any add/edit/remove changes the digest. */
function hashSkills(root) {
  if (!existsSync(root)) return { count: 0, sha256: null };
  const files = [];
  const walk = (dir) => {
    for (const name of readdirSync(dir).sort()) {
      const p = join(dir, name);
      if (statSync(p).isDirectory()) walk(p);
      else files.push(p);
    }
  };
  walk(root);
  const h = createHash("sha256");
  for (const f of files) {
    h.update(relative(root, f).split("\\").join("/"));
    h.update("\0");
    h.update(readFileSync(f));
    h.update("\0");
  }
  return {
    count: files.filter((f) => basename(f) === "SKILL.md").length,
    sha256: `sha256:${h.digest("hex")}`,
  };
}

function sortedObject(obj) {
  return Object.fromEntries(Object.keys(obj).sort().map((k) => [k, obj[k]]));
}

async function main() {
  const pkg = JSON.parse(readFileSync(join(REPO, "package.json"), "utf8"));
  const config = JSON.parse(readFileSync(join(REPO, "opencode.json"), "utf8"));
  const mcp = config.mcp ?? {};

  const oc = await getJson(OPENCODE_UPDATE_API);
  const opencode = {
    channel: "v2",
    installer: "https://opencode.ai/v2/install",
    version: typeof oc?.version === "string" ? oc.version : null,
    source: OPENCODE_UPDATE_API,
  };

  const npm = {}; // launched by npx — pin lives in the command
  const npmGlobal = {}; // installed globally, launched by path — package derived from the path
  const pypi = {};
  const docker = {};
  const localFile = {};
  const remote = {};

  for (const [id, entry] of Object.entries(mcp)) {
    const cls = classify(entry);
    if (cls === "remote") {
      remote[id] = { url: entry.url };
    } else if (cls === "npx") {
      const parsed = parseNpx(entry.command);
      if (!parsed) continue;
      const latest = await npmLatest(parsed.package);
      npm[id] = { package: parsed.package, pin: parsed.pin, latest, stale: Boolean(parsed.pin && latest && parsed.pin !== latest) };
    } else if (cls === "npmGlobal") {
      const path = entry.command[1] ?? entry.command[0];
      const pkgName = packageFromPath(path);
      npmGlobal[id] = { package: pkgName, entry: path, latest: await npmLatest(pkgName) };
    } else if (cls === "uvx") {
      const parsed = parseUvx(entry.command);
      if (!parsed) continue;
      const latest = await pypiLatest(parsed.package);
      pypi[id] = { package: parsed.package, pin: parsed.pin, latest, stale: Boolean(parsed.pin && latest && parsed.pin !== latest) };
    } else if (cls === "docker") {
      const { image, tag } = parseImage(entry.command[entry.command.length - 1]);
      docker[id] = { image, tag, ...(await ociDigest(image, tag)) };
    } else {
      const entryPath = entry.command[0] === "node" ? entry.command[1] : entry.command[0];
      localFile[id] = { entry: entryPath };
    }
  }

  // github-mcp-server is a release binary, not an npm package — record its feed.
  if (localFile.github) {
    localFile.github.repo = "github/github-mcp-server";
    localFile.github.latest = await githubLatestTag("github/github-mcp-server");
  }

  const pluginEntries = Array.isArray(config.plugin) ? config.plugin : [];
  const pluginNpm = {};
  const pluginRepo = {};
  for (const entry of pluginEntries) {
    if (typeof entry !== "string") continue;
    if (entry.startsWith("./") || entry.startsWith("/")) {
      const path = join(REPO, entry.replace(/^\.\//, ""));
      if (existsSync(path)) pluginRepo[basename(path)] = sha256(readFileSync(path));
    } else {
      pluginNpm[entry] = await npmLatest(entry);
    }
  }

  const manifest = {
    repo: { name: pkg.name, version: pkg.version },
    opencode,
    mcp: {
      npm: sortedObject(npm),
      npmGlobal: sortedObject(npmGlobal),
      pypi: sortedObject(pypi),
      docker: sortedObject(docker),
      localFile: sortedObject(localFile),
      remote: sortedObject(remote),
    },
    plugins: {
      sdk: { "@opencode-ai/plugin": await npmLatest("@opencode-ai/plugin") },
      npm: sortedObject(pluginNpm),
      repo: sortedObject(pluginRepo),
    },
    skills: hashSkills(join(REPO, ".opencode/skills")),
  };

  const text = `${JSON.stringify(manifest, null, 2)}\n`;

  if (process.argv.includes("--check")) {
    const existing = existsSync(OUT) ? readFileSync(OUT, "utf8") : "";
    if (existing !== text) {
      console.error("workbench.versions.json is stale — regenerate with:");
      console.error("  node scripts/inventory/versions.mjs");
      process.exit(1);
    }
    console.log("workbench.versions.json is current.");
    return;
  }

  writeFileSync(OUT, text);
  const counts = Object.entries(manifest.mcp)
    .filter(([, v]) => Object.keys(v).length)
    .map(([k, v]) => `${k}=${Object.keys(v).length}`)
    .join(" ");
  console.log(`wrote workbench.versions.json (${counts}, skills=${manifest.skills.count})`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
