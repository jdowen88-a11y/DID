import test from "node:test";
import assert from "node:assert/strict";
import { ElementNeuralModel } from "../src/element_neural_model.js";

test("Element neural model predicts earth for repo structure language", () => {
  const model = new ElementNeuralModel();
  const result = model.forward("build repo files verify structure test proof");
  assert.equal(result.prediction.label, "earth");
});

test("Element neural model predicts air for language mapping", () => {
  const model = new ElementNeuralModel();
  const result = model.forward("explain why map language strategy pattern");
  assert.equal(result.prediction.label, "air");
});

test("Element neural model exposes probabilities for all five elements", () => {
  const model = new ElementNeuralModel();
  const result = model.forward("integrate whole system loop coherence");
  assert.deepEqual(Object.keys(result.probabilities), ["fire", "earth", "water", "air", "ether"]);
  assert.equal(result.prediction.label, "ether");
});
