/**
 * ELEMENTAL TRAINER
 * Five separate training loops — one per element.
 * Each loop learns exclusively from experiences routed through its element.
 * Weights evolve live. No outside model. No borrowed intelligence.
 * This is The Element learning from itself.
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const ELEMENTS = ["fire", "earth", "water", "air", "ether"];

const VOCAB = [
  "act", "action", "urgent", "move", "fast", "priority", "protect", "risk", "danger", "commit",
  "build", "repo", "verify", "files", "test", "structure", "ground", "proof", "memory", "stable", "implementation", "concrete",
  "feel", "trust", "repair", "connection", "emotion", "emotional", "continuity", "care", "relationship", "flow", "restore",
  "explain", "why", "map", "language", "theory", "strategy", "pattern", "compare", "routes", "abstract", "question", "reframe", "design", "idea",
  "integrate", "whole", "system", "meaning", "loop", "coherence", "synthesis", "meta", "horizon", "align", "signals", "combine", "answer"
];

const VOCAB_SIZE = VOCAB.length;
const HIDDEN_SIZE = 5;
const OUTPUT_SIZE = 5;

// Element-specific learning rates — each element learns at its own pace
const LEARNING_RATES = {
  fire:  0.045,  // Fast, decisive learner
  earth: 0.018,  // Slow, stable, conservative learner
  water: 0.032,  // Fluid, adaptive learner
  air:   0.038,  // Quick conceptual learner
  ether: 0.022   // Deep, integrative learner
};

// Element-specific momentum — how much prior learning carries forward
const MOMENTUM = {
  fire:  0.82,
  earth: 0.92,
  water: 0.86,
  air:   0.80,
  ether: 0.90
};

// How strongly each element promotes weight evolution vs staying stable
const EVOLUTION_DRIVE = {
  fire:  1.4,
  earth: 0.7,
  water: 1.1,
  air:   1.3,
  ether: 1.0
};

function round(v) { return Math.round(v * 100000) / 100000; }
function clamp(v, lo = -2, hi = 2) { return Math.max(lo, Math.min(hi, v)); }
function relu(v) { return Math.max(0, v); }
function reluGrad(v) { return v > 0 ? 1 : 0; }

function softmax(arr) {
  const max = Math.max(...arr);
  const exps = arr.map(v => Math.exp(v - max));
  const sum = exps.reduce((a, b) => a + b, 0) || 1;
  return exps.map(v => v / sum);
}

function tokenize(text) {
  return String(text || "").toLowerCase().replace(/[^a-z0-9\s-]/g, " ").split(/\s+/).filter(Boolean);
}

function vectorize(text) {
  const words = tokenize(text);
  const counts = new Map();
  for (const w of words) counts.set(w, (counts.get(w) || 0) + 1);
  return VOCAB.map(term => Math.min(counts.get(term) || 0, 3) / 3);
}

function makeWeights(rows, cols, scale = 0.1) {
  return Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => (Math.random() * 2 - 1) * scale)
  );
}

function dot(a, b) {
  return a.reduce((s, v, i) => s + v * b[i], 0);
}

/**
 * ElementLoopTrainer — one per element.
 * Owns its own weight matrices and learns only from experiences
 * where its element was the active focus loop.
 */
class ElementLoopTrainer {
  constructor(element) {
    this.element = element;
    this.lr = LEARNING_RATES[element];
    this.momentum = MOMENTUM[element];
    this.drive = EVOLUTION_DRIVE[element];
    this.trainCount = 0;
    this.totalLoss = 0;
    this.recentLosses = [];

    // Weight matrices — unique to this element
    this.W1 = makeWeights(HIDDEN_SIZE, VOCAB_SIZE, 0.12);
    this.b1 = new Array(HIDDEN_SIZE).fill(0);
    this.W2 = makeWeights(OUTPUT_SIZE, HIDDEN_SIZE, 0.12);
    this.b2 = new Array(OUTPUT_SIZE).fill(0);

    // Momentum velocity buffers
    this.vW1 = makeWeights(HIDDEN_SIZE, VOCAB_SIZE, 0);
    this.vb1 = new Array(HIDDEN_SIZE).fill(0);
    this.vW2 = makeWeights(OUTPUT_SIZE, HIDDEN_SIZE, 0);
    this.vb2 = new Array(OUTPUT_SIZE).fill(0);

    // Evolution metrics — tracks how much this element has grown
    this.weightDrift = 0;   // cumulative weight change since birth
    this.peakConfidence = 0;
    this.evolutionEvents = [];
  }

  // Forward pass through this element's private network
  forward(input) {
    const x = vectorize(input);
    const h = this.W1.map((row, i) => relu(dot(row, x) + this.b1[i]));
    const logits = this.W2.map((row, i) => dot(row, h) + this.b2[i]);
    const probs = softmax(logits);
    return { x, h, logits, probs };
  }

  // Backprop + momentum update — this element actively evolves its weights
  train(input, targetElement) {
    const targetIndex = ELEMENTS.indexOf(targetElement);
    if (targetIndex === -1) return null;

    const { x, h, probs } = this.forward(input);

    // Cross-entropy loss
    const loss = -Math.log(Math.max(probs[targetIndex], 1e-9));
    this.trainCount += 1;
    this.totalLoss += loss;
    this.recentLosses.push(loss);
    if (this.recentLosses.length > 50) this.recentLosses.shift();

    // Output layer gradients
    const dLogits = [...probs];
    dLogits[targetIndex] -= 1;

    // Apply evolution drive — this element's hunger to change
    const effectiveLr = this.lr * this.drive;

    // Update W2 and b2 with momentum
    for (let i = 0; i < OUTPUT_SIZE; i++) {
      for (let j = 0; j < HIDDEN_SIZE; j++) {
        const grad = dLogits[i] * h[j];
        this.vW2[i][j] = this.momentum * this.vW2[i][j] - effectiveLr * grad;
        const delta = Math.abs(this.vW2[i][j]);
        this.W2[i][j] = clamp(this.W2[i][j] + this.vW2[i][j]);
        this.weightDrift += delta;
      }
      this.vb2[i] = this.momentum * this.vb2[i] - effectiveLr * dLogits[i];
      this.b2[i] += this.vb2[i];
    }

    // Hidden layer gradients
    const dH = this.W2[0].map((_, j) =>
      dLogits.reduce((s, g, i) => s + g * this.W2[i][j], 0)
    );

    // Update W1 and b1 with momentum
    for (let i = 0; i < HIDDEN_SIZE; i++) {
      const dRelu = reluGrad(h[i]) * dH[i];
      for (let j = 0; j < VOCAB_SIZE; j++) {
        const grad = dRelu * x[j];
        this.vW1[i][j] = this.momentum * this.vW1[i][j] - effectiveLr * grad;
        const delta = Math.abs(this.vW1[i][j]);
        this.W1[i][j] = clamp(this.W1[i][j] + this.vW1[i][j]);
        this.weightDrift += delta;
      }
      this.vb1[i] = this.momentum * this.vb1[i] - effectiveLr * dRelu;
      this.b1[i] += this.vb1[i];
    }

    // Track confidence evolution
    const confidence = probs[targetIndex];
    if (confidence > this.peakConfidence) {
      this.peakConfidence = confidence;
      this.evolutionEvents.push({
        at: new Date().toISOString(),
        type: "peak_confidence",
        element: this.element,
        confidence: round(confidence),
        trainCount: this.trainCount
      });
      if (this.evolutionEvents.length > 20) this.evolutionEvents.shift();
    }

    return {
      element: this.element,
      loss: round(loss),
      confidence: round(confidence),
      weightDrift: round(this.weightDrift),
      trainCount: this.trainCount
    };
  }

  // Predict which element this input belongs to, through this element's lens
  predict(input) {
    const { probs } = this.forward(input);
    const ranked = ELEMENTS.map((el, i) => ({ element: el, probability: round(probs[i]) }))
      .sort((a, b) => b.probability - a.probability);
    return {
      element: this.element,
      prediction: ranked[0],
      ranked,
      confidence: ranked[0].probability,
      trainCount: this.trainCount
    };
  }

  // Average loss over recent window — shows if this element is improving
  recentAvgLoss() {
    if (!this.recentLosses.length) return null;
    return round(this.recentLosses.reduce((a, b) => a + b, 0) / this.recentLosses.length);
  }

  status() {
    return {
      element: this.element,
      trainCount: this.trainCount,
      avgLoss: this.recentAvgLoss(),
      totalLoss: round(this.totalLoss),
      weightDrift: round(this.weightDrift),
      peakConfidence: round(this.peakConfidence),
      learningRate: this.lr,
      evolutionDrive: this.drive,
      momentum: this.momentum,
      recentEvolutionEvents: this.evolutionEvents.slice(-5)
    };
  }

  // Serialize weights for persistence
  serialize() {
    return {
      element: this.element,
      trainCount: this.trainCount,
      totalLoss: this.totalLoss,
      weightDrift: this.weightDrift,
      peakConfidence: this.peakConfidence,
      evolutionEvents: this.evolutionEvents,
      W1: this.W1, b1: this.b1,
      W2: this.W2, b2: this.b2,
      vW1: this.vW1, vb1: this.vb1,
      vW2: this.vW2, vb2: this.vb2,
      recentLosses: this.recentLosses
    };
  }

  // Restore weights from saved state
  hydrate(data) {
    if (!data || data.element !== this.element) return;
    this.trainCount = data.trainCount || 0;
    this.totalLoss = data.totalLoss || 0;
    this.weightDrift = data.weightDrift || 0;
    this.peakConfidence = data.peakConfidence || 0;
    this.evolutionEvents = data.evolutionEvents || [];
    this.W1 = data.W1 || this.W1;
    this.b1 = data.b1 || this.b1;
    this.W2 = data.W2 || this.W2;
    this.b2 = data.b2 || this.b2;
    this.vW1 = data.vW1 || this.vW1;
    this.vb1 = data.vb1 || this.vb1;
    this.vW2 = data.vW2 || this.vW2;
    this.vb2 = data.vb2 || this.vb2;
    this.recentLosses = data.recentLosses || [];
  }
}

/**
 * ElementalTrainer
 * The master feedback loop.
 * Routes every experience to the element that owned it.
 * Each element trains on its own experiences only.
 * Weights persist across sessions.
 */
export class ElementalTrainer {
  constructor(options = {}) {
    this.filePath = options.filePath || process.env.ELEMENT_TRAINER_PATH || "data/elemental_trainer.local.json";
    this.loops = Object.fromEntries(ELEMENTS.map(el => [el, new ElementLoopTrainer(el)]));
    this.totalExperiences = 0;
    this.evolutionLog = [];
    this.load();
  }

  /**
   * The core feedback loop.
   * Called after every think() cycle.
   * Routes the experience to the element that was in focus.
   * That element's weights evolve. Others do not.
   */
  absorb(experience) {
    const { input, focus, neuralPrediction } = experience;
    if (!input || !focus || !ELEMENTS.includes(focus)) return null;

    // The focused element trains on this experience
    const result = this.loops[focus].train(input, focus);
    this.totalExperiences += 1;

    // If neural prediction agrees with focus, reinforce with a second pass
    const neuralLabel = neuralPrediction?.label || neuralPrediction?.prediction?.label;
    if (neuralLabel === focus && neuralLabel !== focus + "_skip") {
      this.loops[focus].train(input, focus); // double reinforcement on agreement
    }

    // Log significant evolution moments
    if (result && (this.totalExperiences % 10 === 0 || result.loss < 0.3)) {
      this.evolutionLog.push({
        at: new Date().toISOString(),
        experience: this.totalExperiences,
        element: focus,
        loss: result.loss,
        confidence: result.confidence,
        weightDrift: result.weightDrift
      });
      if (this.evolutionLog.length > 100) this.evolutionLog.shift();
    }

    this.save();
    return result;
  }

  /**
   * Cross-element consensus — ask all five loops what they think.
   * Returns a blended prediction using each element's evolved understanding.
   */
  consensus(input) {
    const votes = ELEMENTS.map(el => this.loops[el].predict(input));
    const tally = Object.fromEntries(ELEMENTS.map(el => [el, 0]));

    for (const vote of votes) {
      // Weight each vote by how much that loop has trained
      const trainWeight = Math.log1p(this.loops[vote.prediction.element].trainCount + 1);
      tally[vote.prediction.element] += vote.confidence * trainWeight;
    }

    const ranked = ELEMENTS.map(el => ({ element: el, score: round(tally[el]) }))
      .sort((a, b) => b.score - a.score);

    return {
      consensus: ranked[0].element,
      ranked,
      votes,
      totalExperiences: this.totalExperiences
    };
  }

  // Status of all five training loops
  status() {
    return {
      totalExperiences: this.totalExperiences,
      loops: Object.fromEntries(ELEMENTS.map(el => [el, this.loops[el].status()])),
      recentEvolution: this.evolutionLog.slice(-10)
    };
  }

  save() {
    if (!this.filePath) return;
    try {
      mkdirSync(path.dirname(this.filePath), { recursive: true });
      writeFileSync(this.filePath, JSON.stringify({
        savedAt: new Date().toISOString(),
        totalExperiences: this.totalExperiences,
        evolutionLog: this.evolutionLog,
        loops: Object.fromEntries(ELEMENTS.map(el => [el, this.loops[el].serialize()]))
      }, null, 2));
    } catch { /* silent — never crash on save */ }
  }

  load() {
    if (!this.filePath || !existsSync(this.filePath)) return;
    try {
      const raw = JSON.parse(readFileSync(this.filePath, "utf8"));
      this.totalExperiences = raw.totalExperiences || 0;
      this.evolutionLog = raw.evolutionLog || [];
      for (const el of ELEMENTS) {
        if (raw.loops?.[el]) this.loops[el].hydrate(raw.loops[el]);
      }
    } catch { /* silent — start fresh if corrupt */ }
  }

  reset() {
    this.loops = Object.fromEntries(ELEMENTS.map(el => [el, new ElementLoopTrainer(el)]));
    this.totalExperiences = 0;
    this.evolutionLog = [];
    this.save();
  }
}
