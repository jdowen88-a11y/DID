import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";

const DATA_PATH = process.argv[2] || "data/element_training.json";
const OUT_PATH = process.argv[3] || "artifacts/generated_element_weights.json";
const HIDDEN_SIZE = 5;
const LEARNING_RATE = 0.18;
const EPOCHS = 140;

function tokenize(text) {
  return String(text || "").toLowerCase().replace(/[^a-z0-9\s-]/g, " ").split(/\s+/).filter(Boolean);
}

function buildVocab(samples) {
  const counts = new Map();
  for (const sample of samples) {
    for (const token of tokenize(sample.text)) counts.set(token, (counts.get(token) || 0) + 1);
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).map(([token]) => token);
}

function vectorize(text, vocab) {
  const counts = new Map();
  for (const token of tokenize(text)) counts.set(token, (counts.get(token) || 0) + 1);
  return vocab.map((token) => Math.min(counts.get(token) || 0, 3) / 3);
}

function softmax(values) {
  const max = Math.max(...values);
  const exps = values.map((value) => Math.exp(value - max));
  const total = exps.reduce((sum, value) => sum + value, 0) || 1;
  return exps.map((value) => value / total);
}

function zeros(rows, cols) {
  return Array.from({ length: rows }, () => Array.from({ length: cols }, () => 0));
}

function seeded(index) {
  const x = Math.sin(index * 999) * 10000;
  return (x - Math.floor(x) - 0.5) * 0.2;
}

function init(rows, cols) {
  return Array.from({ length: rows }, (_, r) => Array.from({ length: cols }, (_, c) => seeded(r * cols + c + 1)));
}

function dot(a, b) {
  return a.reduce((sum, value, index) => sum + value * b[index], 0);
}

function relu(value) {
  return Math.max(0, value);
}

function reluGrad(value) {
  return value > 0 ? 1 : 0;
}

function forward(x, w1, w2, bias) {
  const hiddenRaw = w1.map((weights) => dot(x, weights));
  const hidden = hiddenRaw.map(relu);
  const logits = bias.map((b, labelIndex) => b + hidden.reduce((sum, value, hiddenIndex) => sum + value * w2[hiddenIndex][labelIndex], 0));
  return { hiddenRaw, hidden, logits, probs: softmax(logits) };
}

function labelIndex(labels, label) {
  const index = labels.indexOf(label);
  if (index === -1) throw new Error(`Unknown label: ${label}`);
  return index;
}

const raw = JSON.parse(await readFile(DATA_PATH, "utf8"));
const labels = raw.labels;
const samples = raw.samples;
const vocab = buildVocab(samples);
const inputSize = vocab.length;
let w1 = init(HIDDEN_SIZE, inputSize);
let w2 = init(HIDDEN_SIZE, labels.length);
let bias = Array.from({ length: labels.length }, () => 0);

for (let epoch = 0; epoch < EPOCHS; epoch += 1) {
  for (const sample of samples) {
    const x = vectorize(sample.text, vocab);
    const y = labelIndex(labels, sample.label);
    const out = forward(x, w1, w2, bias);
    const dLogits = out.probs.map((prob, index) => prob - (index === y ? 1 : 0));

    for (let h = 0; h < HIDDEN_SIZE; h += 1) {
      for (let label = 0; label < labels.length; label += 1) {
        w2[h][label] -= LEARNING_RATE * out.hidden[h] * dLogits[label];
      }
    }

    for (let label = 0; label < labels.length; label += 1) {
      bias[label] -= LEARNING_RATE * dLogits[label];
    }

    const dHidden = Array.from({ length: HIDDEN_SIZE }, (_, h) => {
      const downstream = dLogits.reduce((sum, grad, label) => sum + grad * w2[h][label], 0);
      return downstream * reluGrad(out.hiddenRaw[h]);
    });

    for (let h = 0; h < HIDDEN_SIZE; h += 1) {
      for (let i = 0; i < inputSize; i += 1) {
        w1[h][i] -= LEARNING_RATE * dHidden[h] * x[i];
      }
    }
  }
}

function roundMatrix(matrix) {
  return matrix.map((row) => row.map((value) => Math.round(value * 10000) / 10000));
}

const artifact = {
  model: "element-neural-generated-v0",
  createdAt: new Date().toISOString(),
  labels,
  vocab,
  hiddenSize: HIDDEN_SIZE,
  epochs: EPOCHS,
  learningRate: LEARNING_RATE,
  weights: {
    hidden: roundMatrix(w1),
    output: roundMatrix(w2),
    bias: bias.map((value) => Math.round(value * 10000) / 10000)
  }
};

await mkdir(path.dirname(OUT_PATH), { recursive: true });
await writeFile(OUT_PATH, JSON.stringify(artifact, null, 2));
console.log(`Wrote ${OUT_PATH}`);
