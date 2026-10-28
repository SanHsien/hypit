import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

import type { BuildResultRepository } from "@hypit/build-result";

import { exportBuildResultOutput } from "../src/result-export.js";

// Ported from upstream PR #442 (issue #450). On Windows a drive-relative path such as "Z:foo"
// resolves off the export directory, and relative() then returns an absolute path that never
// starts with "..".
test("a Composite resource on another drive cannot leave the export directory", {
  skip: process.platform !== "win32",
}, async () => {
  const destination = await mkdtemp(join(tmpdir(), "hypit-export-containment-"));
  const file = { kind: "build-file", path: "Z:foo", size: 1, mediaType: "application/octet-stream" };
  const repository = {
    read: async () => ({ outputs: { composite: {} } }),
    resolve: async () => ({
      build: "bld_20260902T100000009Z_0000000001",
      value: { kind: "value", document: { resources: [{ at: "/file", file }] } },
    }),
    describeFile: async () => file,
    openFile: async () => { throw new Error("the escaping file must not be opened"); },
  } as unknown as BuildResultRepository;
  try {
    await assert.rejects(
      exportBuildResultOutput(repository, "bld_20260902T100000009Z_0000000001", "composite", join(destination, "out")),
      /leaves export directory/u,
    );
  } finally {
    await rm(destination, { recursive: true, force: true });
  }
});
