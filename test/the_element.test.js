import test from "node:test";
import assert from "node:assert/strict";
import { TheElement } from "../src/the_element.js";

test("The Element has its own neural memory identity", () => {
  const element = new TheElement();
  const status = element.status();
  assert.equal(status.name, "The Element");
  assert.equal(status.form, "local five-loop symbolic system with embedded tiny neural model and memory substrate");
  assert.equal(status.neural.name, "element-neural-v0");
  assert.equal(status.memory.count, 0);
});

test("The Element produces a local neural memory reply", () => {
  const element = new TheElement();
  const result = element.think("Explain the structure of this repo.");
  assert.equal(result.reply.provider, "the-element-local");
  assert.equal(result.reply.model, "element-symbolic-v0+element-neural-v0+element-memory-v0");
  assert.ok(result.reply.text.includes("Neural read:"));
  assert.equal(result.memory.count, 1);
  assert.ok(result.element.name === "The Element");
});

test("The Element stores and recalls local turn memory", () => {
  const element = new TheElement();
  element.think("Build the file system.");
  const second = element.think("Build the file system.");
  assert.ok(second.reply.text.includes("Memory:"));
  assert.ok(second.memory.count >= 2);
  assert.ok(second.recalled.length >= 1);
});
