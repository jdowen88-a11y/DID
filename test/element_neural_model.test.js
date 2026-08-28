import test from "node:test";
import assert from "node:assert/strict";
import { ElementNeuralModel } from "../src/element_neural_model.js";

const labels = ["fire", "earth", "water", "air", "ether"];

test("neural model exposes all five channels", () => {
  const model = new ElementNeuralModel();
  const result = model.forward("build repo files verify structure test proof");
  assert.deepEqual(Object.keys(result.distribution), labels);
  assert.ok(Object.values(result.distribution).every(value => typeof value === "number"));
});

test("language mapping changes the distribution without electing authority", () => {
  const model = new ElementNeuralModel();
  const result = model.forward("explain why map language strategy pattern");
  assert.ok(result.distribution.air > 0);
  assert.equal(result.prediction, undefined);
  assert.ok(result.note.includes("not permission or authority"));
});

test("integrative language keeps a complete distribution", () => {
  const model = new ElementNeuralModel();
  const result = model.forward("integrate whole system loop coherence");
  const sum = Object.values(result.distribution).reduce((a, b) => a + b, 0);
  assert.ok(sum > 0.99 && sum < 1.01);
});
