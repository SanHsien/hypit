import assert from "node:assert/strict";
import childProcess from "node:child_process";
import { syncBuiltinESMExports } from "node:module";
import { join } from "node:path";
import test from "node:test";

import { powershellLiteral, startWithOwnConsole } from "../src/programs.js";

// Ported from upstream PR #443 (issue #451). spawn is mocked throughout, so no test here starts
// PowerShell or any other program.

test("PowerShell literals escape every quote form the tokenizer accepts", () => {
  assert.equal(powershellLiteral("plain"), "'plain'");
  assert.equal(powershellLiteral("it's"), "'it''s'");
  // Windows PowerShell accepts U+2018–U+201B as quote delimiters too; each must
  // double or the literal ends early and reopens script parsing.
  assert.equal(powershellLiteral("it\u2019s"), "'it\u2019\u2019s'");
  assert.equal(powershellLiteral("a\u2018b\u201Ac\u201Bd"), "'a\u2018\u2018b\u201A\u201Ac\u201B\u201Bd'");
});

function captureSpawn(t: import("node:test").TestContext): string[] {
  const commands: string[] = [];
  t.mock.method(childProcess, "spawn", (command: string) => {
    commands.push(command);
    throw new Error("spawn intercepted by test");
  });
  syncBuiltinESMExports();
  t.after(() => { t.mock.restoreAll(); syncBuiltinESMExports(); });
  return commands;
}

test("an environment name that is not a portable identifier is refused before PowerShell runs", async (t) => {
  const commands = captureSpawn(t);
  await assert.rejects(
    startWithOwnConsole({ command: "node", args: [], env: { "A = 1; calc #": "x" } }, "C:\\work", "C:\\work\\p.log"),
    /portable variable name/u,
  );
  assert.deepEqual(commands, []);
});

test("Windows PowerShell is resolved under SystemRoot, never by bare name", { skip: process.env.SystemRoot === undefined }, async (t) => {
  const commands = captureSpawn(t);
  await assert.rejects(
    startWithOwnConsole({ command: "node", args: [], env: { HYPIT_X: "1" } }, "C:\\work", "C:\\work\\p.log"),
    /spawn intercepted/u,
  );
  assert.deepEqual(commands, [join(process.env.SystemRoot!, "System32", "WindowsPowerShell", "v1.0", "powershell.exe")]);
});
