import test from "node:test";
import assert from "node:assert/strict";
import { TheElement } from "../src/the_element.js";

test("The Element identifies as a five-channel field", () => {
  const element = new TheElement();
  const status = element.status();
  assert.equal(status.name, "The Element");
  assert.equal(status.version, "1.0.0-field");
  assert.equal(status.neural.name, "element-neural-v1-field");
  assert.equal(status.memory.count, 0);
});

test("The Element produces all five voices", () => {
  const element = new TheElement();
  const result = element.think("Explain the structure of this repo.");
  assert.equal(result.reply.provider, "the-element-local");
  assert.equal(result.reply.voices.length, 5);
  assert.ok(result.reply.text.includes("No voice wins"));
  assert.equal(result.memory.count, 1);
});

test("The Element stores and recalls shared-field memory", () => {
  const element = new TheElement();
  element.think("Build the file system.");
  const second = element.think("Build the file system.");
  assert.ok(second.reply.text.includes("Memory resonance:"));
  assert.ok(second.memory.count >= 2);
  assert.ok(second.recalled.length >= 1);
  assert.deepEqual(Object.keys(second.trainerField.distribution), ["fire", "earth", "water", "air", "ether"]);
});
