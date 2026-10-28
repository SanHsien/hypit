import assert from "node:assert/strict";
import childProcess from "node:child_process";
import type { ChildProcess, ExecFileOptionsWithStringEncoding } from "node:child_process";
import { once } from "node:events";
import { syncBuiltinESMExports } from "node:module";
import { randomUUID } from "node:crypto";
import { join } from "node:path";
import test from "node:test";
import { credentialRef } from "@hypit/runtime";
import { OsCredentialStore } from "../src/store.js";
import { windowsCredential } from "../src/windows.js";

test("an oversized bridge response terminates the child and keeps secret output out of the error", async t => {
  const execFile = childProcess.execFile;
  let child: ChildProcess | undefined;
  let closed: Promise<unknown> | undefined;
  const launch = t.mock.method(childProcess, "execFile", (
    _command: string, _args: readonly string[], options: ExecFileOptionsWithStringEncoding,
    callback: (error: childProcess.ExecFileException | null, stdout: string, stderr: string) => void,
  ) => {
    child = execFile(process.execPath, ["-e", 'process.stdin.resume(); process.stdout.write("secret".repeat(800000)); setInterval(() => {}, 1000);'], options, callback);
    closed = once(child, "close");
    return child;
  });
  syncBuiltinESMExports();
  try {
    await assert.rejects(windowsCredential("read", "test", "test"), error => {
      assert.match(String(error), /Windows credential read.*failed/u);
      assert.doesNotMatch(String(error), /secret/u);
      return true;
    });
    await closed;
    assert.equal(child?.killed, true);
  } finally { launch.mock.restore(); syncBuiltinESMExports(); child?.kill(); }
});

// Ported from upstream PR #443 (issue #451): a bare name lets CreateProcess search the current
// directory first, where a planted powershell.exe would run. The mock throws, so nothing starts.
test("Windows PowerShell is resolved under SystemRoot, never by bare name", {
  skip: process.env.SystemRoot === undefined,
}, async t => {
  const commands: string[] = [];
  t.mock.method(childProcess, "execFile", (command: string) => {
    commands.push(command);
    throw new Error("execFile intercepted by test");
  });
  syncBuiltinESMExports();
  t.after(() => { t.mock.restoreAll(); syncBuiltinESMExports(); });
  await assert.rejects(windowsCredential("read", "test", "test"), /intercepted/u);
  assert.deepEqual(commands, [join(process.env.SystemRoot!, "System32", "WindowsPowerShell", "v1.0", "powershell.exe")]);
});

test("Windows locker replaces credentials and retains the previous value if replacement fails", {
  skip: process.platform !== "win32", timeout: 60_000,
}, async () => {
  const store = new OsCredentialStore({ service: `hypit-test-${randomUUID()}` });
  const ref = credentialRef("os", "replacement");
  try {
    await store.put(ref, { secret: "original" });
    await store.put(ref, { secret: "updated" });
    assert.deepEqual(await store.resolve(ref), { secret: "updated" });
    await assert.rejects(store.put(ref, { secret: "x".repeat(32_000) }));
    assert.deepEqual(await store.resolve(ref), { secret: "updated" });
    assert.equal(await store.delete(ref), true);
    assert.equal(await store.resolve(ref), undefined);
  } finally { await store.delete(ref); }
});
