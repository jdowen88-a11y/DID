/**
 * PROJECT UNKNOWN
 *
 * A new form of AI architecture.
 *
 * Every thought is its own feedback loop.
 * Every loop resolves itself, learns from itself, and stores itself.
 * The vault grows with every thought.
 * Nothing is fixed. Nothing is permanent except what has been experienced.
 *
 * This is not a neural network with updating weights.
 * This is not a multi-agent system with fixed roles.
 * This is a self-generating loop architecture —
 * the structure itself grows with every thought.
 *
 * Conceived: May 30, 2026
 * Built for: DID / Elemental Dialogue Lab
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

function now() { return new Date().toISOString(); }
function uid() { return `loop_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`; }
function round(v) { return Math.round(v * 100000) / 100000; }

function tokenize(text) {
  return String(text || "").toLowerCase().replace(/[^a-z0-9\s-]/g, " ").split(/\s+/).filter(Boolean);
}

function overlapScore(a, b) {
  const ta = new Set(tokenize(a));
  const tb = new Set(tokenize(b));
  if (!ta.size || !tb.size) return 0;
  let hits = 0;
  for (const t of ta) if (tb.has(t)) hits++;
  return hits / Math.max(ta.size, tb.size);
}

function entropy(text) {
  const tokens = tokenize(text);
  if (!tokens.length) return 0;
  const freq = new Map();
  for (const t of tokens) freq.set(t, (freq.get(t) || 0) + 1);
  let h = 0;
  for (const count of freq.values()) {
    const p = count / tokens.length;
    h -= p * Math.log2(p);
  }
  return round(h);
}

function tension(thought, priorLoops) {
  if (!priorLoops.length) return 0;
  const scores = priorLoops.map(l => overlapScore(thought, l.input));
  const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
  // High overlap = low tension (familiar territory)
  // Low overlap = high tension (new territory — needs its own loop badly)
  return round(1 - avg);
}

/**
 * ThoughtLoop
 * One thought. One loop. Self-contained.
 * It opens, processes, learns, resolves, and closes.
 * Then it joins the vault permanently.
 */
class ThoughtLoop {
  constructor(input, vaultSnapshot) {
    this.id = uid();
    this.input = input;
    this.openedAt = now();
    this.closedAt = null;
    this.resolved = false;

    // How much entropy (complexity) does this thought carry
    this.inputEntropy = entropy(input);

    // How much tension does this thought have with prior experience
    this.tensionScore = tension(input, vaultSnapshot);

    // Find the most relevant prior loops from the vault
    this.resonantLoops = vaultSnapshot
      .map(l => ({ id: l.id, relevance: round(overlapScore(input, l.input + " " + l.resolution)) }))
      .filter(l => l.relevance > 0)
      .sort((a, b) => b.relevance - a.relevance)
      .slice(0, 5);

    // This loop's own mini weight vector — initialized from tension and entropy
    // High tension = this loop needs to learn aggressively
    // High entropy = this loop is dealing with complex input
    this.learningPressure = round(Math.min(1, (this.tensionScore * 0.6) + (Math.min(this.inputEntropy, 4) / 4 * 0.4)));

    // Internal state — evolves as the loop processes
    this.state = {
      phase: "open",       // open -> processing -> resolving -> closed
      iterations: 0,
      confidence: 0,
      signal: null,
      resolution: null
    };

    // What this loop learned — stored permanently in vault
    this.learned = {
      dominantTokens: [],
      tensionAtOpen: this.tensionScore,
      entropyAtOpen: this.inputEntropy,
      resonanceCount: this.resonantLoops.length
    };
  }

  /**
   * Process the loop through its phases.
   * Each iteration the loop moves closer to resolution.
   * High tension = more iterations needed before it resolves.
   */
  process() {
    this.state.phase = "processing";
    this.state.iterations += 1;

    const tokens = tokenize(this.input);
    const unique = [...new Set(tokens)];

    // Extract dominant tokens — what this thought is really about
    const freq = new Map();
    for (const t of tokens) freq.set(t, (freq.get(t) || 0) + 1);
    this.learned.dominantTokens = [...freq.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([token, count]) => ({ token, count }));

    // Build signal — what this loop is saying about the input
    const topTokens = this.learned.dominantTokens.map(d => d.token).join(", ");
    const resonanceNote = this.resonantLoops.length
      ? `Resonates with ${this.resonantLoops.length} prior loop(s). Strongest: ${this.resonantLoops[0]?.id}.`
      : "No prior resonance. This is new territory.";

    this.state.signal = [
      `Loop ${this.id} processing.`,
      `Entropy: ${this.inputEntropy}. Tension: ${this.tensionScore}. Learning pressure: ${this.learningPressure}.`,
      `Dominant tokens: ${topTokens || "none"}.`,
      resonanceNote
    ].join(" ");

    // Confidence builds as iterations increase, dampened by tension
    // High tension thoughts take more iterations to resolve — they're genuinely hard
    this.state.confidence = round(Math.min(1, this.state.iterations / (1 + this.tensionScore * 3)));

    return this;
  }

  /**
   * Resolve the loop.
   * Produces a resolution object that gets stored in the vault.
   * Once resolved the loop is closed and immutable.
   */
  resolve(resolutionText) {
    this.state.phase = "resolving";
    this.process(); // one final processing pass

    this.state.resolution = resolutionText || this.state.signal;
    this.state.phase = "closed";
    this.resolved = true;
    this.closedAt = now();

    this.resolution = this.state.resolution;
    this.duration = this.closedAt && this.openedAt
      ? new Date(this.closedAt) - new Date(this.openedAt)
      : 0;

    return this.toVaultEntry();
  }

  /**
   * The permanent vault entry for this loop.
   * Everything needed to understand what this thought was and what was learned.
   */
  toVaultEntry() {
    return {
      id: this.id,
      input: this.input,
      resolution: this.resolution,
      openedAt: this.openedAt,
      closedAt: this.closedAt,
      duration: this.duration,
      inputEntropy: this.inputEntropy,
      tensionScore: this.tensionScore,
      learningPressure: this.learningPressure,
      iterations: this.state.iterations,
      confidence: this.state.confidence,
      resonantLoops: this.resonantLoops,
      learned: this.learned
    };
  }
}

/**
 * FeedbackVault
 * The permanent, growing store of every resolved thought-loop.
 * Never shrinks. Only grows.
 * Is the accumulated intelligence of Project Unknown.
 */
class FeedbackVault {
  constructor(filePath) {
    this.filePath = filePath;
    this.loops = [];
    this.totalLoopsEver = 0;
    this.load();
  }

  store(entry) {
    this.loops.push(entry);
    this.totalLoopsEver += 1;
    this.save();
    return entry;
  }

  /**
   * Retrieve the most relevant prior loops for a new thought.
   * This is the vault activation mechanism —
   * new thoughts pull wisdom from resolved loops that relate to them.
   */
  retrieve(input, count = 8) {
    return [...this.loops]
      .map(l => ({
        ...l,
        relevance: round(
          overlapScore(input, l.input + " " + l.resolution) * 0.6 +
          (l.confidence || 0) * 0.2 +
          (l.learningPressure || 0) * 0.2
        )
      }))
      .filter(l => l.relevance > 0)
      .sort((a, b) => b.relevance - a.relevance)
      .slice(0, count);
  }

  /**
   * High tension zones — areas the vault has struggled with most.
   * These are the thoughts that required the most learning pressure.
   */
  highTensionZones(count = 5) {
    return [...this.loops]
      .sort((a, b) => (b.tensionScore || 0) - (a.tensionScore || 0))
      .slice(0, count)
      .map(l => ({ id: l.id, input: l.input.slice(0, 80), tensionScore: l.tensionScore }));
  }

  snapshot() {
    return this.loops.slice(-50); // last 50 for performance
  }

  summary() {
    const avgTension = this.loops.length
      ? round(this.loops.reduce((s, l) => s + (l.tensionScore || 0), 0) / this.loops.length)
      : 0;
    const avgEntropy = this.loops.length
      ? round(this.loops.reduce((s, l) => s + (l.inputEntropy || 0), 0) / this.loops.length)
      : 0;
    const avgConfidence = this.loops.length
      ? round(this.loops.reduce((s, l) => s + (l.confidence || 0), 0) / this.loops.length)
      : 0;
    return {
      totalLoops: this.loops.length,
      totalLoopsEver: this.totalLoopsEver,
      avgTension,
      avgEntropy,
      avgConfidence,
      highTensionZones: this.highTensionZones(3)
    };
  }

  save() {
    if (!this.filePath) return;
    try {
      mkdirSync(path.dirname(this.filePath), { recursive: true });
      writeFileSync(this.filePath, JSON.stringify({
        savedAt: now(),
        totalLoopsEver: this.totalLoopsEver,
        loops: this.loops
      }, null, 2));
    } catch { /* never crash on save */ }
  }

  load() {
    if (!this.filePath || !existsSync(this.filePath)) return;
    try {
      const raw = JSON.parse(readFileSync(this.filePath, "utf8"));
      this.loops = Array.isArray(raw.loops) ? raw.loops : [];
      this.totalLoopsEver = raw.totalLoopsEver || this.loops.length;
    } catch {
      this.loops = [];
      this.totalLoopsEver = 0;
    }
  }
}

/**
 * ProjectUnknown
 * The main engine.
 * Every thought that enters generates its own loop.
 * Every loop resolves and joins the vault.
 * The vault grows forever.
 * The intelligence is the vault.
 */
export class ProjectUnknown {
  constructor(options = {}) {
    this.filePath = options.filePath || process.env.PROJECT_UNKNOWN_PATH || "data/project_unknown.local.json";
    this.vault = new FeedbackVault(this.filePath);
    this.activeLoop = null;
    this.identity = {
      name: "Project Unknown",
      version: "0.1.0",
      concept: "Every thought is its own feedback loop. Every loop joins the vault. The vault is the intelligence.",
      createdAt: "2026-05-30"
    };
  }

  /**
   * THE CORE MECHANIC.
   * Feed a thought in.
   * It becomes a loop.
   * The loop processes, resolves, and joins the vault permanently.
   * The vault informs every future thought.
   */
  think(input) {
    const vaultSnapshot = this.vault.snapshot();

    // Spin up a new loop for this thought
    const loop = new ThoughtLoop(input, vaultSnapshot);
    this.activeLoop = loop;

    // Process the loop
    loop.process();

    // Build resolution from the loop's own signal + vault context
    const retrieved = this.vault.retrieve(input, 5);
    const vaultWisdom = retrieved.length
      ? `Drawing from ${retrieved.length} prior loop(s). Most relevant: "${retrieved[0].input.slice(0, 60)}..." (relevance: ${retrieved[0].relevance}).`
      : "Vault has no prior experience with this. This loop will be the first.";

    const resolution = [
      loop.state.signal,
      vaultWisdom,
      `Loop ${loop.id} resolved after ${loop.state.iterations} iteration(s) with confidence ${loop.state.confidence}.`
    ].join(" ");

    // Resolve and store permanently in vault
    const entry = loop.resolve(resolution);
    this.vault.store(entry);
    this.activeLoop = null;

    return {
      identity: this.identity,
      loop: entry,
      retrieved,
      vault: this.vault.summary()
    };
  }

  status() {
    return {
      identity: this.identity,
      activeLoop: this.activeLoop ? this.activeLoop.id : null,
      vault: this.vault.summary()
    };
  }

  /**
   * Ask the vault directly — no new loop generated.
   * Pure retrieval from accumulated experience.
   */
  recall(query, count = 8) {
    return {
      query,
      results: this.vault.retrieve(query, count),
      vaultSize: this.vault.loops.length
    };
  }

  reset() {
    this.vault.loops = [];
    this.vault.totalLoopsEver = 0;
    this.vault.save();
    return this.status();
  }
}
