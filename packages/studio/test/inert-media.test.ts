import assert from "node:assert/strict";
import test from "node:test";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { createServer } from "vite";
import type { StudioBuildLibrary } from "../src/build-library.js";
import type { StudioDomain } from "../src/domain.js";
import type { StudioCompanionRegistry } from "../src/studio-registry.js";
import { inertWorkspaceFile, studioPlugin } from "../src/server.js";

// Ported from upstream PR hypit-ai/hypit#471 before it was merged. The upstream integration test
// compiles a 0.3 project; this fork's Studio has no equivalent fixture, so the Studio domain is a
// stub that only supplies a Surface preview. /__studio/material and /__studio/storyboard call the same
// `inertMedia` helper but need a compiled session and are not exercised here.
const studioPackage = fileURLToPath(new URL("..", import.meta.url));
const inertPolicy = "sandbox allow-downloads";

function assertInert(response: Response, label: string): void {
  assert.equal(response.headers.get("content-security-policy"), inertPolicy, `${label} carries the sandbox CSP`);
  assert.equal(response.headers.get("x-content-type-options"), "nosniff", `${label} carries nosniff`);
}

test("Studio serves Results and Surface previews as inert documents, so an SVG cannot script the Studio origin", async (t) => {
  const root = await mkdtemp(join(tmpdir(), "hypit-studio-inert-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  const payload = `<svg xmlns="http://www.w3.org/2000/svg" width="4" height="4"><script>fetch("/__studio/source",{method:"PUT"})</script></svg>`;
  const bytes = Buffer.from(payload);
  await writeFile(join(root, "logo.svg"), payload);
  await writeFile(join(root, "evil.html"), `<!doctype html><script>fetch("/__studio/source",{method:"PUT"})</script>`);
  const runPath = join(root, "main.svrun");
  await writeFile(runPath, "<svrun/>");
  const domain = {
    surfaces: { resolve: () => ({ vocabulary: { preview: { mediaType: "image/svg+xml", open: async () => bytes } } }) },
  } as unknown as StudioDomain;
  const buildLibrary = {
    library: async () => { throw new Error("unused"); },
    renameArtifact: async () => undefined,
    openArtifact: async (build: string, output: string) => build === "build_1" && output === "main"
      ? {
          mediaType: "image/svg+xml",
          size: bytes.byteLength,
          open: async (range?: { readonly start: number; readonly endExclusive: number }) => (async function* () {
            yield range === undefined ? bytes : bytes.subarray(range.start, range.endExclusive);
          })(),
        }
      : undefined,
    close: async () => {},
  } as unknown as StudioBuildLibrary;
  // Mirror Studio's real layout: Vite's root is the Studio package, and the
  // author workspace is only reachable through `server.fs.allow`.
  const server = await createServer({
    configFile: false, root: studioPackage, logLevel: "silent",
    server: { port: 0, strictPort: false, host: "127.0.0.1", fs: { allow: [root, studioPackage, process.cwd()] } },
    plugins: [studioPlugin({
      source: join(root, "main.svml"), runPath, workspaceRoot: root, domain,
      registry: {} as unknown as StudioCompanionRegistry, buildLibrary,
    })],
  });
  t.after(() => server.close());
  await server.listen();
  const base = server.resolvedUrls!.local[0]!;

  const artifactUrl = new URL("/__studio/artifact?build=build_1&output=main", base);
  const artifact = await fetch(artifactUrl);
  assert.equal(artifact.status, 200);
  assert.equal(artifact.headers.get("content-type"), "image/svg+xml");
  assert.equal(await artifact.text(), payload, "bytes are unchanged for <img> use");
  assertInert(artifact, "a Result");
  const artifactPartial = await fetch(artifactUrl, { headers: { range: "bytes=4-" } });
  assert.equal(artifactPartial.status, 206);
  assert.equal(await artifactPartial.text(), payload.slice(4));
  assertInert(artifactPartial, "a Result Range response");
  const artifactHead = await fetch(artifactUrl, { method: "HEAD" });
  assert.equal(artifactHead.status, 200);
  assertInert(artifactHead, "a Result HEAD response");

  const preview = await fetch(new URL("/__studio/surface-preview?module=%40hypit%2Fx&version=1&surface=s", base));
  assert.equal(preview.status, 200);
  assert.equal(await preview.text(), payload);
  assertInert(preview, "a Surface preview");

  // Vite serves `/@fs/<absolute path>` for everything in `server.fs.allow`,
  // which includes the workspace. Those raw project bytes must be just as inert.
  for (const name of ["logo.svg", "evil.html"]) {
    const raw = await fetch(new URL(`/@fs${join(root, name).replaceAll("\\", "/").replace(/^(?=[A-Za-z]:)/u, "/")}`, base));
    assert.ok(raw.status === 403 || raw.status === 404
      || raw.headers.get("content-security-policy") === inertPolicy,
      `/@fs/${name} is refused or served as an inert document (status ${raw.status})`);
    if (raw.ok) assertInert(raw, `/@fs/${name}`);
  }

  // Studio's own modules are still served normally by Vite.
  const ui = await fetch(new URL("/src/ui/main.ts", base));
  assert.equal(ui.status, 200);
  assert.equal(ui.headers.get("content-security-policy"), null);
});

test("only workspace files reached through Vite's /@fs and /@id are marked inert", () => {
  const workspace = join(tmpdir(), "project");
  const fsUrl = (path: string) => `/@fs${path.replaceAll("\\", "/").replace(/^(?=[A-Za-z]:)/u, "/")}`;
  assert.equal(inertWorkspaceFile(workspace, fsUrl(join(workspace, "art", "logo.svg"))), true);
  assert.equal(inertWorkspaceFile(workspace, `${fsUrl(join(workspace, "evil.html"))}?t=1`), true);
  assert.equal(inertWorkspaceFile(workspace, `/@id${fsUrl(join(workspace, "evil.svg")).slice("/@fs".length)}`), true);
  assert.equal(inertWorkspaceFile(workspace, fsUrl(join(workspace, "node_modules", "@hypit", "studio", "src", "ui", "main.ts"))), false);
  assert.equal(inertWorkspaceFile(workspace, fsUrl(join(tmpdir(), "elsewhere", "logo.svg"))), false);
  assert.equal(inertWorkspaceFile(workspace, "/src/ui/main.ts"), false);
  assert.equal(inertWorkspaceFile(workspace, "/__studio/session"), false);
});
