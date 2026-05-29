import test from "node:test";
import assert from "node:assert/strict";
import { TheElement } from "../src/the_element.js";

test("The Element has its own identity", () => {
  const element = new TheElement();
  const status = element.status();
  assert.equal(status.name, "The Element");
  assert.equal(status.form, "local five-loop symbolic reasoning system");
});

test("The Element produces a local reply", () => {
  const element = new TheElement();
  const result = element.think("Explain the structure of this repo.");
  assert.equal(result.reply.provider, "the-element-local");
  assert.ok(result.reply.text.includes("Read:"));
  assert.ok(result.element.name === "The Element");
});

test("The Element stores local turn memory", () => {
  const element = new TheElement();
  element.think("Build the file system.");
  const second = element.think("Build the file system.");
  assert.ok(second.reply.text.includes("matches an earlier turn"));
});
