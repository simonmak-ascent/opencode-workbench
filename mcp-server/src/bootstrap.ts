/**
 * `bootstrap_host` orchestration: take a bare Linux target (local or SSH) to a
 * VDD-configured OpenCode workstation in one call.
 *
 * Order: inspect → platform plan (dry-run unless `upgrade`) → apply the profile
 * (installs latest-stable OpenCode) → capture the resolved version → verify.
 * Never reads or transmits secret values; the env template is names-only.
 */
import type { Target } from "./target.js";
import {
  apply,
  inspect,
  verify,
  type ApplyResult,
  type CloneOptions,
  type VerifyResult,
} from "./clone.js";
import {
  buildUpgradePlan,
  planPlatform,
  parseVersion,
  type PackageFamily,
  type PackageManagerId,
  type PackagePlan,
} from "./platform.js";

export interface BootstrapOptions extends CloneOptions {
  /** Execute the platform upgrade (default false: plan only). */
  upgrade?: boolean;
  /** Use non-interactive upgrade flags (default true). */
  assumeYes?: boolean;
  /** Pin a specific OpenCode version instead of latest stable. */
  opencodeVersion?: string;
}

export interface PlatformReport {
  osId: string | null;
  osIdLike: string[];
  osName: string | null;
  osVersion: string | null;
  kernel: string | null;
  arch: string | null;
  packageManager: PackageManagerId | null;
  family: PackageFamily;
}

export interface OpenCodeInstall {
  installed: boolean;
  version: string | null;
  requested: string | null;
}

export interface BootstrapResult {
  target: string;
  platform: PlatformReport;
  upgrade: PackagePlan;
  opencode: OpenCodeInstall;
  apply: ApplyResult;
  verify: VerifyResult;
  warnings: string[];
}

function platformReport(info: {
  osId?: string;
  osIdLike?: string;
  osName?: string;
  osVersion?: string;
  kernel?: string;
  arch?: string;
  packageManager?: string;
}): PlatformReport {
  const packageManager = planPlatform(info);
  const family: PackageFamily = packageManager
    ? buildUpgradePlan(packageManager).family
    : "unknown";
  return {
    osId: info.osId ?? null,
    osIdLike: (info.osIdLike ?? "")
      .toLowerCase()
      .split(/\s+/)
      .filter(Boolean),
    osName: info.osName ?? null,
    osVersion: info.osVersion ?? null,
    kernel: info.kernel ?? null,
    arch: info.arch ?? null,
    packageManager,
    family,
  };
}

async function captureOpencodeVersion(target: Target, requested: string | null): Promise<string | null> {
  const res = await target.run(
    `export PATH="$HOME/.opencode/bin:$PATH"\nopencode --version 2>/dev/null | head -n1\n`,
    { timeoutMs: 30_000 },
  );
  const parsed = parseVersion(res.stdout);
  return parsed ?? requested;
}

export async function bootstrap(
  target: Target,
  options: BootstrapOptions = {},
): Promise<BootstrapResult> {
  const warnings: string[] = [];
  const info = await inspect(target);
  const platform = platformReport(info);
  const upgrade = buildUpgradePlan(platform.packageManager, {
    assumeYes: options.assumeYes !== false,
  });

  if (!platform.packageManager) {
    warnings.push(
      `unsupported package manager (osId=${platform.osId ?? "unknown"}); platform upgrade skipped`,
    );
  }

  // Optional, explicitly-requested platform upgrade. Dry-run by default.
  if (options.upgrade && !options.dryRun && platform.packageManager) {
    for (const command of upgrade.commands) {
      const res = await target.run(`${command}\n`, { timeoutMs: 1_800_000 });
      upgrade.output.push(`${command} (exit ${res.code})`);
    }
    upgrade.executed = true;
    upgrade.rebootAdvisory = true;
  }

  // Pin a specific version first if requested, then let apply fill the rest.
  if (options.opencodeVersion && !options.dryRun) {
    await target.run(
      `curl -fsSL https://opencode.ai/install | bash -s -- --version ${options.opencodeVersion} || true\n`,
      { timeoutMs: 300_000 },
    );
  }

  const applyResult = await apply(target, options);
  const opencodeInstalled = applyResult.installed.some((i) => i.id === "opencode");
  const version = options.dryRun
    ? options.opencodeVersion ?? null
    : await captureOpencodeVersion(target, options.opencodeVersion ?? null);
  const verifyResult = await verify(target, options);

  return {
    target: target.label,
    platform,
    upgrade,
    opencode: {
      installed: opencodeInstalled,
      version,
      requested: options.opencodeVersion ?? null,
    },
    apply: applyResult,
    verify: verifyResult,
    warnings,
  };
}
