import test from "node:test";
import assert from "node:assert/strict";
import { ElementalCore } from "../src/core.js";

test("starts with ether focus and five loops", () => {
  const core = new ElementalCore();
  const status = core.status();
  assert.equal(status.focus, "ether");
  assert.equal(status.loops.length, 5);
});

test("repo and verification language activates earth", () => {
  const core = new ElementalCore();
  const result = core.tick("build repo files verify structure test proof");
  assert.equal(result.ranked[0].id, "earth");
});

test("manual focus handoff works", () => {
  const core = new ElementalCore();
  const scan = core.setFocus("fire", "test");
  assert.equal(scan.focus, "fire");
  assert.equal(scan.events[0].type, "manual_focus_handoff");
});

test("repeated overlapping inputs can form resonance links", () => {
  const core = new ElementalCore();
  core.tick("system loop meaning integrate map explain why");
  const result = core.tick("system loop meaning integrate map explain why");
  assert.ok(result.events.some((event) => event.type === "resonance_link"));
});
