/**
 * Pure, side-effect-free platform logic for `provision_host`.
 *
 * Nothing here touches the network, the filesystem or a target: every function
 * takes plain input and returns plain output, so the whole cross-distro mapping
 * and upgrade plan is unit-testable without root access.
 */

export type PackageManagerId = "apt-get" | "dnf" | "yum" | "apk" | "pacman" | "zypper";

export type PackageFamily = "debian" | "rhel" | "arch" | "suse" | "alpine" | "unknown";

export interface OsRelease {
  id: string;
  idLike: string[];
  version: string | null;
  name: string | null;
}

export interface ManagerSpec {
  id: PackageManagerId;
  family: PackageFamily;
  /** Refresh package metadata. */
  update: string;
  /** Upgrade every installed package (the "kernel up" step). */
  upgrade: string;
  /** Non-interactive suffix appended to the upgrade command when assumeYes. */
  yesFlag: string;
  /** Command whose stdout lists upgradable packages, when one exists. */
  upgradableQuery: string | null;
}

export interface PackagePlan {
  packageManager: PackageManagerId | null;
  family: PackageFamily;
  /** Ordered update-then-upgrade commands; empty when the manager is unknown. */
  commands: string[];
  /** Number of upgradable packages when parseable, else null. */
  upgradable: number | null;
  /** True only after the commands have actually been run. */
  executed: boolean;
  /** Captured per-command results when executed. */
  output: string[];
  /** Kernels/reboots may be required after an upgrade. */
  rebootAdvisory: boolean;
}

/** Parse the key=value surface of /etc/os-release. */
export function parseOsRelease(content: string): OsRelease {
  const map: Record<string, string> = {};
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq === -1) continue;
    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();
    const quoted =
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"));
    if (quoted && value.length >= 2) value = value.slice(1, -1);
    map[key] = value;
  }
  return {
    id: (map.ID ?? "").toLowerCase(),
    idLike: (map.ID_LIKE ?? "")
      .toLowerCase()
      .split(/\s+/)
      .filter(Boolean),
    version: map.VERSION_ID ?? null,
    name: map.NAME ?? null,
  };
}

const MANAGER_SPECS: Record<PackageManagerId, ManagerSpec> = {
  "apt-get": {
    id: "apt-get",
    family: "debian",
    update: "apt-get update",
    upgrade: "apt-get dist-upgrade",
    yesFlag: "-y",
    upgradableQuery: "apt list --upgradable 2>/dev/null",
  },
  dnf: {
    id: "dnf",
    family: "rhel",
    update: "dnf makecache",
    upgrade: "dnf upgrade --refresh",
    yesFlag: "-y",
    upgradableQuery: "dnf -q check-update 2>/dev/null",
  },
  yum: {
    id: "yum",
    family: "rhel",
    update: "yum makecache",
    upgrade: "yum update",
    yesFlag: "-y",
    upgradableQuery: "yum -q check-update 2>/dev/null",
  },
  apk: {
    id: "apk",
    family: "alpine",
    update: "apk update",
    upgrade: "apk -U upgrade",
    yesFlag: "",
    upgradableQuery: "apk version -l '<' 2>/dev/null",
  },
  pacman: {
    id: "pacman",
    family: "arch",
    update: "pacman -Sy",
    upgrade: "pacman -Syu",
    yesFlag: "--noconfirm",
    upgradableQuery: "pacman -Qu 2>/dev/null",
  },
  zypper: {
    id: "zypper",
    family: "suse",
    update: "zypper refresh",
    upgrade: "zypper update",
    yesFlag: "-n",
    upgradableQuery: "zypper list-updates 2>/dev/null",
  },
};

export function managerSpec(id: PackageManagerId): ManagerSpec {
  return MANAGER_SPECS[id];
}

/** Map a distro (by ID / ID_LIKE) to its package manager, or null if unknown. */
export function resolvePackageManager(os: Pick<OsRelease, "id" | "idLike">): PackageManagerId | null {
  const tokens = new Set([os.id, ...os.idLike].filter(Boolean));
  const has = (...names: string[]): boolean => names.some((n) => tokens.has(n));

  if (has("debian", "ubuntu", "linuxmint", "pop", "raspbian", "devuan", "kali")) return "apt-get";
  if (
    has(
      "fedora",
      "rhel",
      "centos",
      "rocky",
      "almalinux",
      "ol",
      "oracle",
      "amzn",
      "scientific",
    )
  )
    return "dnf";
  if (has("arch", "archlinux", "manjaro", "endeavouros", "cachyos", "garuda")) return "pacman";
  if (has("opensuse", "opensuse-leap", "opensuse-tumbleweed", "sles", "suse")) return "zypper";
  if (has("alpine")) return "apk";
  return null;
}

/** Prefer the manager detected on the host; fall back to the distro mapping. */
export function planPlatform(info: {
  osId?: string;
  osIdLike?: string;
  packageManager?: string;
}): PackageManagerId | null {
  const detected = info.packageManager;
  if (detected && detected in MANAGER_SPECS) return detected as PackageManagerId;
  const idLike = (info.osIdLike ?? "")
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean);
  return resolvePackageManager({ id: (info.osId ?? "").toLowerCase(), idLike });
}

/** Insert a flag right after the command name, e.g. `apt-get dist-upgrade` -> `apt-get -y dist-upgrade`. */
export function insertFlag(command: string, flag: string): string {
  if (!flag) return command;
  const [bin = command, ...rest] = command.split(" ");
  return [bin, flag, ...rest].join(" ");
}

/**
 * Build the ordered upgrade plan. With `assumeYes` the upgrade command carries
 * the manager's non-interactive flag. No command is ever executed here.
 */
export function buildUpgradePlan(
  packageManager: PackageManagerId | null,
  opts: { assumeYes?: boolean } = {},
): PackagePlan {
  if (!packageManager) {
    return {
      packageManager: null,
      family: "unknown",
      commands: [],
      upgradable: null,
      executed: false,
      output: [],
      rebootAdvisory: false,
    };
  }
  const spec = managerSpec(packageManager);
  const assumeYes = opts.assumeYes !== false;
  const upgrade = assumeYes ? insertFlag(spec.upgrade, spec.yesFlag) : spec.upgrade;
  return {
    packageManager,
    family: spec.family,
    commands: [spec.update, upgrade],
    upgradable: null,
    executed: false,
    output: [],
    rebootAdvisory: false,
  };
}

/** Extract the upgradable count from an `apt list --upgradable` style output. */
export function parseUpgradableCount(
  packageManager: PackageManagerId | null,
  stdout: string,
): number | null {
  if (!packageManager) return null;
  const lines = stdout.split(/\r?\n/).map((l) => l.trim());
  if (packageManager === "apt-get") {
    // e.g. `nginx/jammy-updates 1.24 amd64 [upgradable from: 1.18]`
    return lines.filter((l) => l.includes("[upgradable from:")).length;
  }
  // Generic fallback: count non-empty, non-header lines.
  return lines.filter(
    (l) => l && !/^(Listing|Obsoleting|Last metadata|Available Upgrades)/i.test(l),
  ).length;
}

/**
 * Parse the first semantic version out of `opencode --version` output.
 * Tolerant of prefixes/suffixes; returns null when nothing matches.
 */
export function parseVersion(output: string): string | null {
  const m = /(\d+\.\d+\.\d+(?:[-+][0-9A-Za-z.-]+)?)/.exec(output);
  return m?.[1] ?? null;
}
