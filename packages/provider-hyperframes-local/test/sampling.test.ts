import assert from "node:assert/strict";
import test from "node:test";

import { videoSlots } from "../src/sampling.js";

function srcOf(src: string): string {
  const tag = `<video id="clip" src="${src}" data-hypit-start-frame="0" data-hypit-end-frame="2"`
    + ` data-hypit-source-frame="0/1" data-hypit-source-rate="1/1" data-hypit-source-fps="30/1">`;
  const [slot] = videoSlots(tag);
  return slot!.src;
}

test("video attributes decode each entity exactly once", () => {
  assert.equal(srcOf("a&amp;lt;b"), "a&lt;b");
  assert.equal(srcOf("a&amp;amp;b"), "a&amp;b");
  assert.equal(srcOf("a&amp;quot;b&amp;gt;"), "a&quot;b&gt;");
  assert.equal(srcOf("x?a=1&amp;b=&lt;&gt;&quot;"), "x?a=1&b=<>\"");
});
