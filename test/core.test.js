import test from "node:test";
import assert from "node:assert/strict";
import { ElementalCore } from "../src/core.js";

test("starts with five simultaneous loops", () => {
  const core = new ElementalCore();
  const status = core.status();
  assert.equal(status.loops.length, 5);
  assert.equal(status.mode, "five-loop simultaneous allowance field");
  assert.ok(status.loops.every(loop => loop.amplification === 1));
});

test("repo and verification language can strengthen earth without silencing others", () => {
  const core = new ElementalCore();
  const result = core.tick("build repo files verify structure test proof");
  assert.equal(result.ranked[0].id, "earth");
  assert.equal(result.voices.length, 5);
  assert.ok(result.signals.every(signal => signal.channel === "present"));
});

test("manual amplification never mutes another loop", () => {
  const core = new ElementalCore();
  const scan = core.setFocus("fire", "compatibility test");
  assert.equal(scan.regions.find(r => r.id === "fire").amplification, 1.25);
  assert.ok(scan.regions.every(r => r.active));
  assert.equal(scan.events[0].type, "voice_amplified");
});

test("repeated overlapping inputs can form resonance links", () => {
  const core = new ElementalCore();
  core.tick("system loop meaning integrate map explain why");
  const result = core.tick("system loop meaning integrate map explain why");
  assert.ok(result.events.some(event => event.type === "resonance_link"));
});
