import { ElementalCore } from "./core.js";
import { ElementNeuralModel } from "./element_neural_model.js";
import { ElementMemory } from "./element_memory.js";

const LOOP_PERSONAS = {
  fire: {
    name: "Fire",
    stance: "action-first",
    verbs: ["ignite", "cut", "move", "commit"],
    line: "I am choosing the next move and reducing hesitation."
  },
  earth: {
    name: "Earth",
    stance: "structure-first",
    verbs: ["ground", "verify", "build", "store"],
    line: "I am turning the input into structure and checking the load-bearing facts."
  },
  water: {
    name: "Water",
    stance: "continuity-first",
    verbs: ["read", "flow", "repair", "connect"],
    line: "I am reading the emotional current and keeping the response connected."
  },
  air: {
    name: "Air",
    stance: "map-first",
    verbs: ["name", "map", "reframe", "compare"],
    line: "I am mapping the language and finding alternate routes through the question."
  },
  ether: {
    name: "Ether",
    stance: "integration-first",
    verbs: ["merge", "align", "synthesize", "route"],
    line: "I am combining the loop signals into one coherent answer."
  }
};

function clean(input) {
  return String(input || "").trim();
}

function sentence(input) {
  const text = clean(input);
  return text.endsWith(".") || text.endsWith("?") || text.endsWith("!") ? text : `${text}.`;
}

function pick(list, index) {
  return list[Math.abs(index) % list.length];
}

function scoreMap(scan) {
  return Object.fromEntries((scan.regions || []).map((region) => [region.id, region.load || 0]));
}

export class TheElement {
  constructor() {
    this.core = new ElementalCore();
    this.neural = new ElementNeuralModel();
    this.memory = new ElementMemory();
    this.turns = [];
    this.identity = {
      name: "The Element",
      version: "0.3.0",
      form: "local five-loop symbolic system with embedded tiny neural model and memory substrate",
      neuralModel: this.neural.name,
      createdFor: "DID repository"
    };
  }

  reset() {
    this.turns = [];
    this.memory.reset();
    return this.core.reset();
  }

  status() {
    return {
      ...this.identity,
      ...this.core.status(),
      turnCount: this.turns.length,
      neural: {
        name: this.neural.name,
        kind: this.neural.kind,
        labels: this.neural.labels,
        vocabSize: this.neural.vocab.length
      },
      memory: this.memory.summary()
    };
  }

  scan() {
    const scan = this.core.scan();
    return {
      ...scan,
      element: this.identity,
      neural: {
        name: this.neural.name,
        kind: this.neural.kind,
        labels: this.neural.labels,
        vocabSize: this.neural.vocab.length
      },
      memory: this.memory.summary()
    };
  }

  setFocus(loop, reason) {
    return this.core.setFocus(loop, reason);
  }

  think(input) {
    const scan = this.core.tick(input);
    const neural = this.neural.influence(input, scoreMap(scan));
    const recalled = this.memory.recall(input, 3);
    const reply = this.compose(input, scan, neural.prediction, recalled);
    const turn = {
      at: new Date().toISOString(),
      input: clean(input),
      focus: scan.focus,
      neuralPrediction: neural.prediction.prediction,
      reply
    };
    this.turns.push(turn);
    if (this.turns.length > 100) this.turns.shift();
    const memoryTrace = this.memory.add({ ...turn, neuralWinner: neural.prediction.prediction?.label });
    return { ...scan, element: this.identity, neural: neural.prediction, blendedScores: neural.mixed, recalled, memoryTrace, memory: this.memory.summary(), reply };
  }

  compose(input, scan, neuralRun, recalled = []) {
    const focus = scan.focus || "ether";
    const persona = LOOP_PERSONAS[focus] || LOOP_PERSONAS.ether;
    const regions = scan.regions || [];
    const ranked = [...regions].sort((a, b) => (b.load || 0) - (a.load || 0));
    const second = ranked.find((item) => item.id !== focus) || ranked[1];
    const memoryLine = this.memoryLine(input, recalled);
    const action = pick(persona.verbs, scan.tickCount || 0);
    const neuralWinner = neuralRun?.prediction?.label || "unknown";
    const neuralConfidence = neuralRun?.prediction?.probability ?? 0;

    const text = [
      `${persona.name} is in focus. ${persona.line}`,
      `Neural read: ${neuralWinner} at ${Math.round(neuralConfidence * 100)}% confidence using ${neuralRun?.model || "element-neural-v0"}.`,
      `Read: ${sentence(input)}`,
      `Main operation: ${action}. Secondary signal: ${second?.id || "none"}.`,
      memoryLine,
      this.nextStep(focus, neuralWinner, input)
    ].filter(Boolean).join("\n\n");

    return {
      provider: "the-element-local",
      model: "element-symbolic-v0+element-neural-v0+element-memory-v0",
      focus,
      neuralWinner,
      neuralConfidence,
      text
    };
  }

  memoryLine(input, recalled = []) {
    if (recalled.length) {
      const best = recalled[0];
      return `Memory: recalled ${recalled.length} related trace(s). Strongest trace was ${best.id} with focus ${best.focus}/${best.neuralWinner} and relevance ${best.relevance}.`;
    }
    if (!this.turns.length) return "Memory: this is the first stored turn in the current run.";
    const recent = this.turns.slice(-3).map((turn) => `${turn.focus}/${turn.neuralPrediction?.label || "none"}`).join(" -> ");
    const repeated = this.turns.some((turn) => turn.input.toLowerCase() === clean(input).toLowerCase());
    return repeated
      ? `Memory: this input matches an earlier turn. Recent focus/neural path: ${recent}.`
      : `Memory: recent focus/neural path is ${recent}.`;
  }

  nextStep(focus, neuralWinner, input) {
    const text = clean(input).toLowerCase();
    if (text.includes("code") || text.includes("repo") || text.includes("file")) {
      return "Next step: turn the idea into a concrete file, route, test, or dashboard change.";
    }
    if (text.includes("why") || text.includes("explain")) {
      return "Next step: separate the core claim, the evidence, and the unknowns.";
    }
    if (focus !== neuralWinner && neuralWinner !== "unknown") {
      return `Next step: compare symbolic focus (${focus}) against neural prediction (${neuralWinner}) before answering harder.`;
    }
    if (focus === "fire") return "Next step: choose the smallest useful action and execute it cleanly.";
    if (focus === "earth") return "Next step: make the structure testable.";
    if (focus === "water") return "Next step: preserve continuity while reducing noise.";
    if (focus === "air") return "Next step: name the pattern, then test the map against reality.";
    return "Next step: merge the strongest loop signals into one practical answer.";
  }
}
