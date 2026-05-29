const LABELS = ["fire", "earth", "water", "air", "ether"];

const VOCAB = [
  "act", "action", "urgent", "move", "fast", "priority", "protect", "risk", "danger", "commit",
  "build", "repo", "verify", "files", "test", "structure", "ground", "proof", "memory", "stable", "implementation", "concrete",
  "feel", "trust", "repair", "connection", "emotion", "emotional", "continuity", "care", "relationship", "flow", "restore",
  "explain", "why", "map", "language", "theory", "strategy", "pattern", "compare", "routes", "abstract", "question", "reframe", "design", "idea",
  "integrate", "whole", "system", "meaning", "loop", "coherence", "synthesis", "meta", "horizon", "align", "signals", "combine", "answer"
];

const HIDDEN_WEIGHTS = [
  [0.9,0.8,0.7,0.7,0.8,0.9,0.7,0.8,0.8,0.7,-0.2,-0.2,-0.2,-0.2,-0.2,-0.1,-0.2,-0.2,-0.2,-0.2,-0.2,-0.2,-0.1,-0.1,-0.1,-0.1,-0.1,-0.1,-0.1,-0.1,-0.1,-0.1,-0.2,-0.2,-0.1,-0.1,-0.1,-0.1,-0.1,-0.1,-0.1,-0.1,-0.1,-0.1,-0.1,-0.1,-0.1,-0.1,-0.1,-0.1,-0.1,-0.1,-0.1,-0.1,-0.1,-0.1],
  [-0.2,-0.2,-0.2,-0.1,-0.1,-0.1,-0.1,-0.1,-0.1,-0.1,0.9,0.8,0.9,0.8,0.8,0.9,0.8,0.8,0.8,0.7,0.8,0.7,-0.1,-0.1,-0.1,-0.1,-0.1,-0.1,-0.1,-0.1,-0.1,-0.1,-0.1,-0.1,-0.1,-0.1,-0.1,-0.1,-0.1,-0.1,-0.1,-0.1,-0.1,-0.1,-0.1,-0.1,-0.1,-0.1,-0.1,-0.1,-0.1,-0.1,-0.1,-0.1,-0.1,-0.1],
  [-0.1,-0.1,-0.1,-0.1,-0.1,-0.1,0.2,-0.1,-0.1,-0.1,-0.1,-0.1,-0.1,-0.1,-0.1,-0.1,-0.1,-0.1,0.2,-0.1,-0.1,-0.1,0.9,0.8,0.9,0.8,0.9,0.8,0.8,0.8,0.7,0.7,-0.1,-0.1,-0.1,-0.1,-0.1,-0.1,-0.1,-0.1,-0.1,-0.1,-0.1,-0.1,-0.1,-0.1,-0.1,0.1,0.1,-0.1,-0.1,-0.1,-0.1,-0.1,-0.1,-0.1],
  [-0.1,-0.1,-0.1,-0.1,-0.1,-0.1,-0.1,-0.1,-0.1,-0.1,-0.1,-0.1,-0.1,-0.1,0.1,0.1,-0.1,-0.1,-0.1,-0.1,-0.1,-0.1,-0.1,-0.1,-0.1,-0.1,-0.1,-0.1,-0.1,-0.1,-0.1,-0.1,0.9,0.8,0.9,0.8,0.8,0.9,0.8,0.8,0.7,0.7,0.8,0.7,0.7,-0.1,-0.1,0.1,0.1,-0.1,-0.1,-0.1,-0.1,-0.1,-0.1,-0.1],
  [-0.1,-0.1,-0.1,-0.1,-0.1,-0.1,-0.1,-0.1,-0.1,-0.1,-0.1,-0.1,-0.1,-0.1,-0.1,0.1,-0.1,-0.1,0.1,-0.1,-0.1,-0.1,-0.1,-0.1,-0.1,-0.1,-0.1,0.1,0.1,-0.1,-0.1,-0.1,-0.1,-0.1,0.1,-0.1,-0.1,0.1,-0.1,-0.1,-0.1,-0.1,-0.1,0.1,0.1,0.9,0.9,0.8,0.8,0.9,0.8,0.8,0.8,0.7,0.8,0.7]
];

const OUTPUT_WEIGHTS = [
  [1.4,-0.25,-0.15,-0.15,-0.15],
  [-0.2,1.4,-0.15,-0.15,-0.15],
  [-0.15,-0.15,1.4,-0.15,-0.15],
  [-0.15,-0.15,-0.15,1.4,-0.15],
  [-0.15,-0.15,-0.15,-0.15,1.4]
];

const BIAS = [0.02, 0.04, 0.01, 0.02, 0.05];

function tokenize(text) {
  return String(text || "").toLowerCase().replace(/[^a-z0-9\s-]/g, " ").split(/\s+/).filter(Boolean);
}

function vectorize(text) {
  const words = tokenize(text);
  const counts = new Map();
  for (const word of words) counts.set(word, (counts.get(word) || 0) + 1);
  return VOCAB.map((term) => Math.min(counts.get(term) || 0, 3) / 3);
}

function relu(value) {
  return Math.max(0, value);
}

function dot(a, b) {
  return a.reduce((sum, value, index) => sum + value * b[index], 0);
}

function softmax(values) {
  const max = Math.max(...values);
  const exps = values.map((value) => Math.exp(value - max));
  const total = exps.reduce((sum, value) => sum + value, 0) || 1;
  return exps.map((value) => value / total);
}

function round(value) {
  return Math.round(value * 1000) / 1000;
}

export class ElementNeuralModel {
  constructor() {
    this.name = "element-neural-v0";
    this.kind = "tiny local neural classifier";
    this.labels = LABELS;
    this.vocab = VOCAB;
  }

  forward(text) {
    const input = vectorize(text);
    const hidden = HIDDEN_WEIGHTS.map((weights) => relu(dot(input, weights)));
    const logits = LABELS.map((_, labelIndex) => {
      return BIAS[labelIndex] + hidden.reduce((sum, value, hiddenIndex) => sum + value * OUTPUT_WEIGHTS[hiddenIndex][labelIndex], 0);
    });
    const probabilities = softmax(logits);
    const ranked = LABELS.map((label, index) => ({ label, probability: round(probabilities[index]) })).sort((a, b) => b.probability - a.probability);
    return {
      model: this.name,
      kind: this.kind,
      input,
      hidden: hidden.map(round),
      logits: logits.map(round),
      probabilities: Object.fromEntries(LABELS.map((label, index) => [label, round(probabilities[index])])),
      ranked,
      prediction: ranked[0]
    };
  }

  influence(text, baseScores = {}) {
    const prediction = this.forward(text);
    const mixed = { ...baseScores };
    for (const label of LABELS) {
      const current = Number(mixed[label] || 0);
      const neural = prediction.probabilities[label] || 0;
      mixed[label] = round(current * 0.72 + neural * 0.28);
    }
    return { prediction, mixed };
  }
}
