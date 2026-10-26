import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import test from "node:test";

/**
 * The fork's maintenance tools (tools/*.py) are Python and have their own unittest suite in
 * tools/tests. CI's job is `pnpm test`, so this runs that suite there; without it the tools could
 * break while every gate stayed green.
 */
test("the fork maintenance tools pass their own unit tests", () => {
  const attempts: string[] = [];
  // `python3` is skipped on Windows: there it can be the Microsoft Store alias, which opens a window.
  for (const python of [process.env.PYTHON, "python", ...(process.platform === "win32" ? [] : ["python3"])]) {
    if (python === undefined || python.length === 0) continue;
    const result = spawnSync(python, [
      "-I", "-m", "unittest", "discover", "-s", "tools/tests", "-t", "tools/tests",
    ], { encoding: "utf8", windowsHide: true, env: { ...process.env, PYTHONUTF8: "1", PYTHONDONTWRITEBYTECODE: "1" } });
    if (result.error !== undefined) { attempts.push(`${python}: ${result.error.message}`); continue; }
    assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
    return;
  }
  assert.fail(`no Python interpreter could be started (${attempts.join("; ")}); set PYTHON`);
});
