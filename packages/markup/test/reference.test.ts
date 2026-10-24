import assert from "node:assert/strict";
import test from "node:test";

import { MarkupFrontendError } from "../src/error.js";
import { parseOpeningTag } from "../src/syntax.js";

/**
 * The language of the reference grammar before the CodeQL js/redos fix, written without a regular
 * expression: its dotted segments only repeat characters the leading segment already allows.
 */
function originalAccepts(path: string): boolean {
  const head = /[A-Za-z_]/u;
  const tail = /[A-Za-z0-9_.:-]/u;
  return path.length > 0 && head.test(path[0]!) && [...path.slice(1)].every((char) => tail.test(char));
}

function acceptsReference(path: string): boolean {
  try {
    const tag = parseOpeningTag({ name: "reference.hyp", text: `<x value={${path}}/>` }, 0);
    assert.deepEqual(tag.attributes.value, { kind: "reference", path });
    return true;
  } catch (error) {
    if (error instanceof MarkupFrontendError && error.code === "MARKUP_REFERENCE") return false;
    throw error;
  }
}

test("reference attributes accept the same paths as the original grammar", () => {
  for (const path of ["a", "_x", "clip.result", "a.b.c", "ns:item-1.out", "A.", "a..b", "a.0", "a.-"]) {
    assert.equal(acceptsReference(path), true, path);
  }
  for (const path of ["", "0a", ".a", "-a", ":a", "a!", "a b", "a/b", "a.!"]) {
    assert.equal(acceptsReference(path), false, path);
  }
  const alphabet = ["A", "z", "_", "0", ".", ":", "-", "!"];
  const visit = (path: string): void => {
    assert.equal(acceptsReference(path), originalAccepts(path), JSON.stringify(path));
    if (path.length < 4) for (const char of alphabet) visit(path + char);
  };
  visit("");
});

test("an invalid reference with many dotted segments is rejected in bounded time", () => {
  const path = `${"A.".repeat(30)}!`;
  const started = performance.now();
  assert.equal(acceptsReference(path), false);
  const elapsed = performance.now() - started;
  assert.ok(elapsed < 50, `rejecting ${path.length} characters took ${elapsed.toFixed(1)}ms`);
});
