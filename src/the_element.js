/**
 * THE ELEMENT
 * Version 0.5.0
 *
 * The complete unified brain.
 *
 * PREMISE (Project Unknown):
 * Every thought is its own feedback loop.
 * Seven semantic models process each thought as working parts of the brain.
 * Every loop resolves and stores itself in the vault permanently.
 *
 * ARCHITECTURE (Elemental System):
 * Five elemental loops — each with its own identity, training weights, and learning trajectory.
 * The seven semantic models feed the elemental loops.
 * The vault is the deep memory underneath everything.
 */

import { ElementalCore } from "./core.js";
import { ElementNeuralModel } from "./element_neural_model.js";
import { ElementMemory } from "./element_memory.js";
import { ElementalTrainer } from "./elemental_trainer.js";
import { ProjectUnknown } from "./project_unknown.js";

const LOOP_PERSONAS = {
  fire:  { name: "Fire",  stance: "action-first",      verbs: ["ignite","cut","move","commit"],          line: "I am choosing the next move and reducing hesitation." },
  earth: { name: "Earth", stance: "structure-first",    verbs: ["ground","verify","build","store"],        line: "I am turning the input into structure and checking the load-bearing facts." },
  water: { name: "Water", stance: "continuity-first",   verbs: ["read","flow","repair","connect"],        line: "I am reading the emotional current and keeping the response connected." },
  air:   { name: "Air",   stance: "map-first",          verbs: ["name","map","reframe","compare"],        line: "I am mapping the language and finding alternate routes through the question." },
  ether: { name: "Ether", stance: "integration-first",  verbs: ["merge","align","synthesize","route"],   line: "I am combining the loop signals into one coherent answer." }
};

function clean(input) { return String(input || "").trim(); }
function sentence(input) { const t = clean(input); return t.endsWith(".") || t.endsWith("?") || t.endsWith("!") ? t : `${t}.`; }
function pick(list, index) { return list[Math.abs(index) % list.length]; }
function scoreMap(scan) { return Object.fromEntries((scan.regions || []).map(r => [r.id, r.load || 0])); }

export class TheElement {
  constructor() {
    this.core    = new ElementalCore();
    this.neural  = new ElementNeuralModel();
    this.memory  = new ElementMemory();
    this.trainer = new ElementalTrainer();
    this.unknown = new ProjectUnknown();   // THE PREMISE — every thought is its own loop
    this.turns   = [];
    this.identity = {
      name: "The Element",
      version: "0.5.0",
      form: "Unified brain: five elemental training loops + seven semantic models + self-generating feedback vault",
      premise: "Every thought is its own feedback loop. The vault grows forever. The intelligence is the vault.",
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
      neural: { name: this.neural.name, kind: this.neural.kind, labels: this.neural.labels, vocabSize: this.neural.vocab.length },
      memory: this.memory.summary(),
      training: this.trainer.status(),
      vault: this.unknown.status()
    };
  }

  scan() {
    const scan = this.core.scan();
    return {
      ...scan,
      element: this.identity,
      neural: { name: this.neural.name, kind: this.neural.kind, labels: this.neural.labels, vocabSize: this.neural.vocab.length },
      memory: this.memory.summary(),
      training: this.trainer.status(),
      vault: this.unknown.status()
    };
  }

  setFocus(loop, reason) { return this.core.setFocus(loop, reason); }

  think(input) {
    // ── STEP 1: Elemental core tick (symbolic loop scoring)
    const scan = this.core.tick(input);

    // ── STEP 2: Static neural model influence
    const neural = this.neural.influence(input, scoreMap(scan));

    // ── STEP 3: PROJECT UNKNOWN — every thought becomes its own feedback loop
    // Seven semantic models run as working parts of the brain.
    // Produces: agentSignal (for this response) + vault entry (stored permanently)
    const unknownResult = this.unknown.think(input);
    const { agentSignal } = unknownResult;

    // ── STEP 4: The semantic agent signal can override or reinforce focus
    // If seven-layer analysis strongly suggests an element, weight that into focus decision
    let effectiveFocus = scan.focus;
    if (agentSignal.suggestedElement && agentSignal.meaningScore > 0.3) {
      const pull = agentSignal.elementPull[agentSignal.suggestedElement] || 0;
      const currentLoad = scan.activations?.[scan.focus] || 0;
      if (pull > currentLoad * 1.1) {
        effectiveFocus = agentSignal.suggestedElement;
      }
    }

    // ── STEP 5: Vault recall — deep memory from every prior thought-loop
    const vaultRecall = this.unknown.recall(input, 3);

    // ── STEP 6: Surface memory recall
    const recalled = this.memory.recall(input, 3);

    // ── STEP 7: Trainer consensus from five evolved loops
    const trainerConsensus = this.trainer.consensus(input);

    // ── STEP 8: Compose response
    const reply = this.compose(input, scan, neural.prediction, recalled, trainerConsensus, agentSignal, effectiveFocus);

    // ── STEP 9: Store turn
    const turn = {
      at: new Date().toISOString(),
      input: clean(input),
      focus: effectiveFocus,
      neuralPrediction: neural.prediction.prediction,
      trainerConsensus: trainerConsensus.consensus,
      dominantSemanticLayer: agentSignal.dominantLayer,
      suggestedElement: agentSignal.suggestedElement,
      reply
    };
    this.turns.push(turn);
    if (this.turns.length > 100) this.turns.shift();

    // ── STEP 10: Store in surface memory (enriched with semantic layer)
    const memoryTrace = this.memory.add({ ...turn, neuralWinner: neural.prediction.prediction?.label });

    // ── STEP 11: Elemental trainer absorbs experience — weights evolve
    const trainingResult = this.trainer.absorb({
      input: clean(input),
      focus: effectiveFocus,
      neuralPrediction: neural.prediction.prediction
    });

    return {
      ...scan,
      element: this.identity,
      effectiveFocus,
      neural: neural.prediction,
      blendedScores: neural.mixed,
      recalled,
      memoryTrace,
      memory: this.memory.summary(),
      trainerConsensus,
      trainingResult,
      training: this.trainer.status(),
      agentSignal,
      vaultRecall: vaultRecall.results,
      vaultEntry: unknownResult.vaultEntry,
      vault: unknownResult.vault,
      reply
    };
  }

  compose(input, scan, neuralRun, recalled, trainerConsensus, agentSignal, effectiveFocus) {
    const focus = effectiveFocus || scan.focus || "ether";
    const persona = LOOP_PERSONAS[focus] || LOOP_PERSONAS.ether;
    const regions = scan.regions || [];
    const ranked = [...regions].sort((a, b) => (b.load || 0) - (a.load || 0));
    const second = ranked.find(r => r.id !== focus) || ranked[1];
    const action = pick(persona.verbs, scan.tickCount || 0);
    const neuralWinner = neuralRun?.prediction?.label || "unknown";
    const neuralConfidence = neuralRun?.prediction?.probability ?? 0;
    const consensusLabel = trainerConsensus?.consensus || "unknown";
    const totalExperiences = trainerConsensus?.totalExperiences ?? 0;
    const semanticNote = agentSignal?.dominantLayer
      ? `Semantic read: ${agentSignal.dominantLayer} dominant (${agentSignal.dominantDescription}). Stance: ${agentSignal.reflectedStance || "neutral"}. Tone: ${agentSignal.affectiveArousal > 0.2 ? "high" : agentSignal.affectiveArousal < -0.2 ? "low" : "neutral"} arousal.`
      : null;
    const memoryLine = this.memoryLine(input, recalled);

    const text = [
      `${persona.name} is in focus. ${persona.line}`,
      `Neural read: ${neuralWinner} at ${Math.round(neuralConfidence * 100)}% confidence.`,
      semanticNote,
      totalExperiences > 0 ? `Trained consensus (${totalExperiences} experiences): ${consensusLabel}.` : null,
      `Read: ${sentence(input)}`,
      `Main operation: ${action}. Secondary signal: ${second?.id || "none"}.`,
      memoryLine,
      this.nextStep(focus, neuralWinner, agentSignal, input)
    ].filter(Boolean).join("\n\n");

    return {
      provider: "the-element-local",
      model: "element-v0.5-unified",
      focus,
      effectiveFocus,
      neuralWinner,
      neuralConfidence,
      consensusLabel,
      dominantSemanticLayer: agentSignal?.dominantLayer,
      suggestedElement: agentSignal?.suggestedElement,
      text
    };
  }

  memoryLine(input, recalled = []) {
    if (recalled.length) {
      const best = recalled[0];
      return `Memory: recalled ${recalled.length} trace(s). Strongest: ${best.id} (focus: ${best.focus}/${best.neuralWinner}, relevance: ${best.relevance}).`;
    }
    if (!this.turns.length) return "Memory: first stored turn in current run.";
    const recent = this.turns.slice(-3).map(t => `${t.focus}/${t.neuralPrediction?.label || "none"}`).join(" -> ");
    const repeated = this.turns.some(t => t.input.toLowerCase() === clean(input).toLowerCase());
    return repeated
      ? `Memory: this input matches an earlier turn. Recent path: ${recent}.`
      : `Memory: recent path is ${recent}.`;
  }

  nextStep(focus, neuralWinner, agentSignal, input) {
    const text = clean(input).toLowerCase();
    if (text.includes("code") || text.includes("repo") || text.includes("file")) return "Next step: turn the idea into a concrete file, route, test, or dashboard change.";
    if (text.includes("why") || text.includes("explain")) return "Next step: separate the core claim, the evidence, and the unknowns.";
    if (agentSignal?.suggestedElement && agentSignal.suggestedElement !== focus) return `Next step: semantic analysis suggests ${agentSignal.suggestedElement} but ${focus} is in focus — compare before answering harder.`;
    if (focus !== neuralWinner && neuralWinner !== "unknown") return `Next step: compare symbolic focus (${focus}) against neural prediction (${neuralWinner}).`;
    if (focus === "fire") return "Next step: choose the smallest useful action and execute it cleanly.";
    if (focus === "earth") return "Next step: make the structure testable.";
    if (focus === "water") return "Next step: preserve continuity while reducing noise.";
    if (focus === "air") return "Next step: name the pattern, then test the map against reality.";
    return "Next step: merge the strongest loop signals into one practical answer.";
  }
}
