import { describe, it, expect } from "vitest";
import {
  buildUpgradePlan,
  managerSpec,
  parseOsRelease,
  parseUpgradableCount,
  parseVersion,
  planPlatform,
  resolvePackageManager,
} from "../src/platform";

const UBUNTU = [
  'PRETTY_NAME="Ubuntu 24.04 LTS"',
  'NAME="Ubuntu"',
  'VERSION_ID="24.04"',
  "ID=ubuntu",
  "ID_LIKE=debian",
  "HOME_URL=https://www.ubuntu.com/",
].join("\n");

const FEDORA = ['NAME="Fedora Linux"', "ID=fedora", "VERSION_ID=40"].join("\n");
const ARCH = ['NAME="Arch Linux"', "ID=arch", "ID_LIKE=archlinux"].join("\n");
const SUSE = ['NAME="openSUSE Leap"', "ID=opensuse-leap", "ID_LIKE=suse"].join("\n");
const ALPINE = ['NAME="Alpine Linux"', "ID=alpine", "VERSION_ID=3.20"].join("\n");
const GENTOO = ['NAME="Gentoo"', "ID=gentoo"].join("\n");

describe("parseOsRelease", () => {
  it("parses ids, id_like and strips quotes", () => {
    const os = parseOsRelease(UBUNTU);
    expect(os.id).toBe("ubuntu");
    expect(os.idLike).toEqual(["debian"]);
    expect(os.version).toBe("24.04");
    expect(os.name).toBe("Ubuntu");
  });

  it("tolerates comments, blanks and single quotes", () => {
    const os = parseOsRelease("# comment\n\nID='rocky'\nID_LIKE='rhel fedora'\n");
    expect(os.id).toBe("rocky");
    expect(os.idLike).toEqual(["rhel", "fedora"]);
    expect(os.version).toBeNull();
  });

  it("passes through name only when quoted form is used", () => {
    const os = parseOsRelease('NAME="Fedora Linux"\nID=fedora\nVERSION_ID=40\n');
    expect(os.name).toBe("Fedora Linux");
    expect(os.version).toBe("40");
  });
});

describe("resolvePackageManager", () => {
  it.each([
    [UBUNTU, "apt-get"],
    [FEDORA, "dnf"],
    [ARCH, "pacman"],
    [SUSE, "zypper"],
    [ALPINE, "apk"],
  ])("maps distro to manager (%s)", (content, expected) => {
    const os = parseOsRelease(content);
    expect(resolvePackageManager(os)).toBe(expected);
  });

  it("returns null for unsupported distros", () => {
    expect(resolvePackageManager(parseOsRelease(GENTOO))).toBeNull();
  });
});

describe("planPlatform", () => {
  it("prefers the manager already detected on the host", () => {
    expect(planPlatform({ osId: "ubuntu", packageManager: "dnf" })).toBe("dnf");
  });

  it("falls back to the distro mapping when none was detected", () => {
    expect(planPlatform({ osId: "ubuntu", osIdLike: "debian" })).toBe("apt-get");
    expect(planPlatform({ osId: "rocky", osIdLike: "rhel centos" })).toBe("dnf");
  });

  it("returns null when unknown", () => {
    expect(planPlatform({ osId: "gentoo" })).toBeNull();
  });
});

describe("buildUpgradePlan", () => {
  it("orders update then upgrade with a non-interactive flag", () => {
    const plan = buildUpgradePlan("apt-get", { assumeYes: true });
    expect(plan.commands).toEqual(["apt-get update", "apt-get -y dist-upgrade"]);
    expect(plan.family).toBe("debian");
    expect(plan.executed).toBe(false);
  });

  it("omits the flag when assumeYes is false", () => {
    const plan = buildUpgradePlan("pacman", { assumeYes: false });
    expect(plan.commands).toEqual(["pacman -Sy", "pacman -Syu"]);
  });

  it("appends the manager-specific flag", () => {
    expect(buildUpgradePlan("zypper").commands).toEqual(["zypper refresh", "zypper -n update"]);
    expect(buildUpgradePlan("apk").commands).toEqual(["apk update", "apk -U upgrade"]);
  });

  it("returns an empty plan for an unsupported manager", () => {
    const plan = buildUpgradePlan(null);
    expect(plan.commands).toEqual([]);
    expect(plan.packageManager).toBeNull();
    expect(plan.family).toBe("unknown");
  });
});

describe("parseUpgradableCount", () => {
  it("counts apt upgradable lines", () => {
    const out = [
      "Listing...",
      "nginx/jammy-updates 1.24.0-1ubuntu1 amd64 [upgradable from: 1.18.0-6ubuntu14.4]",
      "curl/jammy-updates 7.81.0-1ubuntu1.16 amd64 [upgradable from: 7.81.0-1ubuntu1.15]",
    ].join("\n");
    expect(parseUpgradableCount("apt-get", out)).toBe(2);
  });

  it("returns null without a manager", () => {
    expect(parseUpgradableCount(null, "anything")).toBeNull();
  });
});

describe("managerSpec", () => {
  it("exposes the family and upgrade command per manager", () => {
    expect(managerSpec("dnf").upgrade).toBe("dnf upgrade --refresh");
    expect(managerSpec("apk").family).toBe("alpine");
  });
});

describe("parseVersion", () => {
  it("extracts a semver from opencode --version output", () => {
    expect(parseVersion("1.0.180")).toBe("1.0.180");
    expect(parseVersion("opencode v0.1.48\n")).toBe("0.1.48");
    expect(parseVersion("no version here")).toBeNull();
  });
});
