import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { cpSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import test from "node:test";

/**
 * hypit.cmd is the Windows launcher this fork ships in place of the POSIX `hypit` script. It runs
 * as a hidden console child of this test (no window), against a stand-in bin/hypit.mjs.
 */
const windowsOnly = { skip: process.platform === "win32" ? false : "hypit.cmd runs on Windows only" };
const launcher = resolve(import.meta.dirname, "..", "hypit.cmd");

/** Install directories a user can really have: `Program Files (x86)` holds a `)`, others a `&`. */
const installDirectories = [
  ["plain", "hypit"],
  ["Program Files (x86)", "hypit"],
  ["Tom & Jerry", "hypit"],
] as const;

function run(directory: string, ...args: string[]) {
  const result = spawnSync("cmd.exe", ["/d", "/s", "/c", `""${join(directory, "hypit.cmd")}" ${args.join(" ")}"`], {
    encoding: "utf8", windowsHide: true, windowsVerbatimArguments: true,
  });
  assert.equal(result.error, undefined);
  return result;
}

for (const segments of installDirectories) {
  const label = segments.join("\\");
  const withDirectory = (body: (directory: string) => void) => {
    const root = mkdtempSync(join(tmpdir(), "hypit-cmd-"));
    try {
      const directory = join(root, ...segments);
      mkdirSync(join(directory, "bin"), { recursive: true });
      cpSync(launcher, join(directory, "hypit.cmd"));
      body(directory);
    } finally { rmSync(root, { recursive: true, force: true }); }
  };

  test(`hypit.cmd runs the launcher with its arguments and exit code from ${label}`, windowsOnly, () => {
    withDirectory((directory) => {
      writeFileSync(join(directory, "bin", "hypit.mjs"),
        'console.log("RAN", process.argv.slice(2).join("|")); process.exit(7);\n');
      const result = run(directory, "build", "--debug");
      assert.match(result.stdout, /RAN build\|--debug/u, `${result.stdout}\n${result.stderr}`);
      assert.equal(result.status, 7);
    });
  });

  test(`hypit.cmd names the missing dependencies and exits 1 from ${label}`, windowsOnly, () => {
    withDirectory((directory) => {
      const result = run(directory, "build");
      assert.match(result.stderr, /dependencies are not installed/u, `${result.stdout}\n${result.stderr}`);
      assert.match(result.stderr, /pnpm install --frozen-lockfile/u);
      assert.equal(result.status, 1);
    });
  });
}
