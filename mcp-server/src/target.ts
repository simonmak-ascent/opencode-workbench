import { spawn } from "node:child_process";

/**
 * Where a clone/install operation runs. `local` targets the machine hosting the
 * MCP server; `ssh` targets a remote Linux machine over the system `ssh` binary
 * (so `~/.ssh/config`, agents and keys all work as usual).
 */
export type TargetSpec =
  | { mode: "local"; cwd?: string }
  | {
      mode: "ssh";
      host: string;
      user?: string;
      port?: number;
      identityFile?: string;
      cwd?: string;
    };

export interface CommandResult {
  /** Process exit code (127 when the binary could not be spawned). */
  code: number;
  stdout: string;
  stderr: string;
  /** The command text, for logging/echoing. */
  command: string;
}

export interface Target {
  readonly label: string;
  /** Run a shell script on the target (fed to `bash -s` on stdin). */
  run(script: string, opts?: { timeoutMs?: number }): Promise<CommandResult>;
}

const DEFAULT_TIMEOUT_MS = 120_000;

function decode(chunks: Buffer[]): string {
  return Buffer.concat(chunks).toString("utf8");
}

function spawnCollect(
  file: string,
  args: string[],
  script: string,
  opts: { cwd?: string; timeoutMs: number; label: string },
): Promise<CommandResult> {
  return new Promise((resolve) => {
    const child = spawn(file, args, {
      cwd: opts.cwd,
      stdio: ["pipe", "pipe", "pipe"],
    });
    const stdout: Buffer[] = [];
    const stderr: Buffer[] = [];
    let settled = false;

    const timer = setTimeout(() => {
      if (!settled) {
        child.kill("SIGKILL");
      }
    }, opts.timeoutMs);

    const finish = (code: number) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      resolve({
        code,
        stdout: decode(stdout),
        stderr: decode(stderr),
        command: script,
      });
    };

    child.stdout.on("data", (d: Buffer) => stdout.push(d));
    child.stderr.on("data", (d: Buffer) => stderr.push(d));
    child.on("error", (err) => {
      stderr.push(Buffer.from(String(err.message)));
      finish(127);
    });
    child.on("close", (code) => finish(code ?? 1));

    child.stdin.write(script);
    child.stdin.end();
  });
}

export function createTarget(spec: TargetSpec): Target {
  if (spec.mode === "local") {
    return {
      label: "local",
      run(script, opts) {
        return spawnCollect("bash", ["-s"], script, {
          cwd: spec.cwd,
          timeoutMs: opts?.timeoutMs ?? DEFAULT_TIMEOUT_MS,
          label: "local",
        });
      },
    };
  }

  const dest = spec.user ? `${spec.user}@${spec.host}` : spec.host;
  const sshArgs = ["-o", "BatchMode=yes", "-o", "ConnectTimeout=10", "-T"];
  if (spec.port) sshArgs.push("-p", String(spec.port));
  if (spec.identityFile) sshArgs.push("-i", spec.identityFile);
  sshArgs.push(dest, "--");
  // Remote command is always `bash -s`; the script goes over stdin unmodified.
  if (spec.cwd) {
    sshArgs.push(`cd ${shellQuote(spec.cwd)} && exec bash -s`);
  } else {
    sshArgs.push("bash -s");
  }

  const args = sshArgs;

  return {
    label: `ssh ${dest}`,
    run(script, opts) {
      return spawnCollect("ssh", args, script, {
        timeoutMs: opts?.timeoutMs ?? DEFAULT_TIMEOUT_MS,
        label: `ssh ${dest}`,
      });
    },
  };
}

/** POSIX single-quote a string for safe interpolation into a shell command. */
export function shellQuote(value: string): string {
  return `'${value.replace(/'/g, `'\\''`)}'`;
}
