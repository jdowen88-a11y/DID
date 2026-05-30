/**
 * PROJECT UNKNOWN
 * Version 0.2.0
 *
 * Every thought is its own feedback loop.
 * Every loop passes through seven semantic embedding models —
 * each one processing a distinct layer of meaning:
 *
 *   1. Conceptual  — what the words literally mean
 *   2. Connotative — emotional/cultural associations
 *   3. Collocative  — word patterns and combinations
 *   4. Affective    — emotional charge and sentiment
 *   5. Social       — power, formality, relational role
 *   6. Reflected    — implied attitude and belief
 *   7. Thematic     — topic structure and information flow
 *
 * The seven embeddings are fed into a unified meaning loop.
 * That loop produces TWO outputs:
 *   A) A vault entry — stored permanently
 *   B) An agent signal — pushed to the agent for its answer
 *
 * The vault grows forever. The intelligence is the vault.
 *
 * Conceived: May 30, 2026
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

function now() { return new Date().toISOString(); }
function uid() { return `loop_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`; }
function round(v) { return Math.round(v * 100000) / 100000; }
function clamp(v, lo = 0, hi = 1) { return Math.max(lo, Math.min(hi, v)); }

function tokenize(text) {
  return String(text || "").toLowerCase().replace(/[^a-z0-9\s-]/g, " ").split(/\s+/).filter(Boolean);
}

// ─────────────────────────────────────────────
// TF-IDF ENGINE
// Smarter than raw token overlap.
// Rare words that appear matter more than common words.
// ─────────────────────────────────────────────

class TFIDF {
  constructor() {
    this.corpus = []; // array of token arrays
    this.dfCache = new Map();
  }

  addDocument(text) {
    this.corpus.push(tokenize(text));
    this.dfCache.clear(); // invalidate cache
  }

  df(term) {
    if (this.dfCache.has(term)) return this.dfCache.get(term);
    const count = this.corpus.filter(doc => doc.includes(term)).length;
    this.dfCache.set(term, count);
    return count;
  }

  tf(term, tokens) {
    const count = tokens.filter(t => t === term).length;
    return tokens.length ? count / tokens.length : 0;
  }

  idf(term) {
    const N = this.corpus.length || 1;
    const d = this.df(term) || 0;
    return Math.log((N + 1) / (d + 1)) + 1; // smoothed
  }

  vectorize(text) {
    const tokens = tokenize(text);
    const terms = [...new Set(tokens)];
    const vec = new Map();
    for (const term of terms) {
      vec.set(term, this.tf(term, tokens) * this.idf(term));
    }
    return vec;
  }

  cosineSimilarity(vecA, vecB) {
    let dot = 0, magA = 0, magB = 0;
    for (const [term, val] of vecA) {
      dot += val * (vecB.get(term) || 0);
      magA += val * val;
    }
    for (const val of vecB.values()) magB += val * val;
    const denom = Math.sqrt(magA) * Math.sqrt(magB);
    return denom ? round(dot / denom) : 0;
  }

  similarity(textA, textB) {
    return this.cosineSimilarity(this.vectorize(textA), this.vectorize(textB));
  }
}

const globalTFIDF = new TFIDF();

// ─────────────────────────────────────────────
// SEVEN SEMANTIC EMBEDDING MODELS
// Each one processes a distinct layer of meaning.
// Each runs independently with its own vocabulary
// and its own scoring logic.
// ─────────────────────────────────────────────

const SEMANTIC_MODELS = {

  /**
   * 1. CONCEPTUAL
   * Denotative/dictionary meaning.
   * What does this literally refer to?
   */
  conceptual: {
    id: "conceptual",
    description: "Denotative meaning — what the words literally mean",
    vocab: [
      "define", "means", "is", "refers", "concept", "object", "entity", "thing", "what",
      "type", "kind", "category", "class", "form", "structure", "function", "purpose",
      "system", "process", "state", "condition", "property", "attribute", "relation"
    ],
    encode(text) {
      const tokens = tokenize(text);
      const set = new Set(tokens);
      let score = 0;
      for (const term of this.vocab) if (set.has(term)) score += 1;
      const uniqueness = new Set(tokens).size / (tokens.length || 1);
      return {
        model: this.id,
        score: round(clamp(score / this.vocab.length + uniqueness * 0.2)),
        dominantTokens: tokens.slice(0, 6),
        signal: `Conceptual density: ${round(score / (this.vocab.length || 1))}. Lexical uniqueness: ${round(uniqueness)}.`
      };
    }
  },

  /**
   * 2. CONNOTATIVE
   * Emotional and cultural associations beyond literal meaning.
   */
  connotative: {
    id: "connotative",
    description: "Emotional/cultural associations beyond literal meaning",
    positiveMarkers: ["hope", "love", "safe", "trust", "warm", "bright", "good", "free", "peace", "joy", "strong", "grow", "heal", "open", "light"],
    negativeMarkers: ["danger", "fear", "dark", "threat", "death", "pain", "trap", "cold", "fail", "weak", "broken", "lost", "shame", "hate", "war"],
    encode(text) {
      const tokens = tokenize(text);
      const set = new Set(tokens);
      let pos = 0, neg = 0;
      for (const t of this.positiveMarkers) if (set.has(t)) pos++;
      for (const t of this.negativeMarkers) if (set.has(t)) neg++;
      const polarity = round((pos - neg) / (pos + neg + 1));
      const charge = pos + neg;
      return {
        model: this.id,
        score: round(clamp(charge / 6)),
        polarity,
        signal: `Connotative charge: ${charge}. Polarity: ${polarity > 0 ? "positive" : polarity < 0 ? "negative" : "neutral"} (${polarity}).`
      };
    }
  },

  /**
   * 3. COLLOCATIVE
   * Word pattern combinations — what words appear together.
   */
  collocative: {
    id: "collocative",
    description: "Word combination patterns and collocations",
    knownPairs: [
      ["strong", "coffee"], ["strong", "wind"], ["strong", "support"],
      ["build", "system"], ["build", "trust"], ["break", "down"],
      ["take", "action"], ["make", "sense"], ["move", "forward"],
      ["high", "risk"], ["deep", "learning"], ["open", "source"],
      ["feedback", "loop"], ["neural", "network"], ["weight", "update"],
      ["long", "term"], ["short", "term"], ["real", "time"]
    ],
    encode(text) {
      const tokens = tokenize(text);
      const set = new Set(tokens);
      let hits = 0;
      const matched = [];
      for (const [a, b] of this.knownPairs) {
        if (set.has(a) && set.has(b)) {
          hits++;
          matched.push(`${a}+${b}`);
        }
      }
      // Also detect adjacent bigrams
      const bigrams = [];
      for (let i = 0; i < tokens.length - 1; i++) bigrams.push(`${tokens[i]}+${tokens[i+1]}`);
      return {
        model: this.id,
        score: round(clamp(hits / 3 + bigrams.length / 40)),
        matchedPairs: matched,
        bigrams: bigrams.slice(0, 5),
        signal: `Collocative hits: ${hits}. Matched pairs: ${matched.join(", ") || "none"}. Bigram count: ${bigrams.length}.`
      };
    }
  },

  /**
   * 4. AFFECTIVE
   * Emotional charge, sentiment, and feeling tone.
   */
  affective: {
    id: "affective",
    description: "Emotional charge and sentiment",
    highArousal: ["urgent", "panic", "excited", "angry", "scared", "thrilled", "furious", "desperate", "overwhelm", "intense"],
    lowArousal: ["calm", "quiet", "slow", "gentle", "still", "rest", "peace", "soft", "steady", "easy"],
    encode(text) {
      const tokens = tokenize(text);
      const set = new Set(tokens);
      let high = 0, low = 0;
      for (const t of this.highArousal) if (set.has(t)) high++;
      for (const t of this.lowArousal) if (set.has(t)) low++;
      const arousal = round((high - low) / (high + low + 1));
      return {
        model: this.id,
        score: round(clamp((high + low) / 5)),
        arousal,
        signal: `Affective arousal: ${arousal > 0.2 ? "high" : arousal < -0.2 ? "low" : "neutral"} (${arousal}). High markers: ${high}. Low markers: ${low}.`
      };
    }
  },

  /**
   * 5. SOCIAL
   * Power, formality, hierarchy, relational role.
   */
  social: {
    id: "social",
    description: "Social power, formality, and relational role",
    formalMarkers: ["please", "sir", "doctor", "professor", "formally", "respectfully", "dear", "hereby", "pursuant", "shall"],
    informalMarkers: ["hey", "yeah", "dude", "gonna", "wanna", "kinda", "stuff", "cool", "ok", "nah"],
    powerMarkers: ["must", "authority", "order", "command", "force", "control", "demand", "require", "enforce"],
    encode(text) {
      const tokens = tokenize(text);
      const set = new Set(tokens);
      let formal = 0, informal = 0, power = 0;
      for (const t of this.formalMarkers) if (set.has(t)) formal++;
      for (const t of this.informalMarkers) if (set.has(t)) informal++;
      for (const t of this.powerMarkers) if (set.has(t)) power++;
      const register = formal > informal ? "formal" : informal > formal ? "informal" : "neutral";
      return {
        model: this.id,
        score: round(clamp((formal + informal + power) / 6)),
        register,
        powerLevel: round(power / (this.powerMarkers.length || 1)),
        signal: `Social register: ${register}. Power markers: ${power}. Formal: ${formal}. Informal: ${informal}.`
      };
    }
  },

  /**
   * 6. REFLECTED
   * Implied attitude, belief, and speaker stance.
   */
  reflected: {
    id: "reflected",
    description: "Implied attitude, belief, and speaker stance",
    certaintyMarkers: ["obviously", "clearly", "certainly", "definitely", "always", "never", "must", "will", "know"],
    uncertaintyMarkers: ["maybe", "perhaps", "might", "could", "possibly", "uncertain", "unclear", "wonder", "guess", "think"],
    beliefMarkers: ["believe", "feel", "think", "sense", "assume", "expect", "trust", "doubt", "suspect"],
    encode(text) {
      const tokens = tokenize(text);
      const set = new Set(tokens);
      let certain = 0, uncertain = 0, belief = 0;
      for (const t of this.certaintyMarkers) if (set.has(t)) certain++;
      for (const t of this.uncertaintyMarkers) if (set.has(t)) uncertain++;
      for (const t of this.beliefMarkers) if (set.has(t)) belief++;
      const stance = certain > uncertain ? "assertive" : uncertain > certain ? "tentative" : "neutral";
      return {
        model: this.id,
        score: round(clamp((certain + uncertain + belief) / 8)),
        stance,
        beliefDensity: round(belief / (tokens.length || 1)),
        signal: `Reflected stance: ${stance}. Certainty: ${certain}. Uncertainty: ${uncertain}. Belief markers: ${belief}.`
      };
    }
  },

  /**
   * 7. THEMATIC
   * Topic structure — what is the theme vs the elaboration.
   */
  thematic: {
    id: "thematic",
    description: "Topic structure and information flow",
    encode(text) {
      const tokens = tokenize(text);
      if (!tokens.length) return { model: this.id, score: 0, theme: null, rheme: null, signal: "Empty input." };

      // Theme = first meaningful word cluster (topic introduction)
      // Rheme = remainder (elaboration)
      const stopwords = new Set(["the", "a", "an", "is", "are", "was", "were", "it", "in", "on", "at", "to", "of", "and", "or", "but", "i", "you", "we"]);
      const meaningful = tokens.filter(t => !stopwords.has(t));
      const themeTokens = meaningful.slice(0, Math.ceil(meaningful.length * 0.35));
      const rhemeTokens = meaningful.slice(Math.ceil(meaningful.length * 0.35));
      const themeStr = themeTokens.slice(0, 4).join(" ");
      const rhemeStr = rhemeTokens.slice(0, 6).join(" ");
      const topicDensity = round(meaningful.length / (tokens.length || 1));

      return {
        model: this.id,
        score: round(clamp(topicDensity)),
        theme: themeStr || null,
        rheme: rhemeStr || null,
        topicDensity,
        signal: `Thematic structure — Theme: "${themeStr}". Rheme: "${rhemeStr}". Topic density: ${topicDensity}.`
      };
    }
  }
};

// ─────────────────────────────────────────────
// UNIFIED MEANING LOOP
// Runs all seven models on the input.
// Fuses their outputs into a single meaning vector.
// Produces two outputs: vault entry + agent signal.
// ─────────────────────────────────────────────

function runUnifiedMeaningLoop(input, loopId) {
  const embeddings = {};
  const signals = [];
  let totalScore = 0;

  for (const [key, model] of Object.entries(SEMANTIC_MODELS)) {
    const result = model.encode(input);
    embeddings[key] = result;
    signals.push(result.signal);
    totalScore += result.score || 0;
  }

  const meaningScore = round(totalScore / Object.keys(SEMANTIC_MODELS).length);

  // Dominant meaning layer — which model scored highest
  const dominant = Object.entries(embeddings)
    .sort((a, b) => (b[1].score || 0) - (a[1].score || 0))[0];

  // Vault entry — permanent, full fidelity
  const vaultPayload = {
    loopId,
    input,
    embeddings,
    meaningScore,
    dominantLayer: dominant[0],
    signals
  };

  // Agent signal — compressed, actionable
  const agentSignal = {
    loopId,
    meaningScore,
    dominantLayer: dominant[0],
    dominantDescription: SEMANTIC_MODELS[dominant[0]].description,
    summary: signals.join(" | "),
    thematic: embeddings.thematic?.theme || null,
    affective: embeddings.affective?.arousal,
    social: embeddings.social?.register,
    reflected: embeddings.reflected?.stance,
    connotative: embeddings.connotative?.polarity
  };

  return { vaultPayload, agentSignal };
}

// ─────────────────────────────────────────────
// THOUGHT LOOP
// ─────────────────────────────────────────────

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

class ThoughtLoop {
  constructor(input, vaultSnapshot) {
    this.id = uid();
    this.input = input;
    this.openedAt = now();
    this.inputEntropy = entropy(input);
    this.resonantLoops = vaultSnapshot
      .map(l => ({ id: l.id, relevance: round(globalTFIDF.similarity(input, (l.input || "") + " " + (l.resolution || ""))) }))
      .filter(l => l.relevance > 0)
      .sort((a, b) => b.relevance - a.relevance)
      .slice(0, 5);
    const avgRelevance = this.resonantLoops.length
      ? this.resonantLoops.reduce((s, l) => s + l.relevance, 0) / this.resonantLoops.length
      : 0;
    this.tensionScore = round(1 - avgRelevance);
    this.learningPressure = round(clamp((this.tensionScore * 0.6) + (Math.min(this.inputEntropy, 4) / 4 * 0.4)));
  }

  resolve(resolution, meaningResult) {
    this.resolution = resolution;
    this.closedAt = now();
    this.meaningEmbeddings = meaningResult.vaultPayload.embeddings;
    this.meaningScore = meaningResult.vaultPayload.meaningScore;
    this.dominantLayer = meaningResult.vaultPayload.dominantLayer;
    return this.toVaultEntry();
  }

  toVaultEntry() {
    return {
      id: this.id,
      input: this.input,
      resolution: this.resolution,
      openedAt: this.openedAt,
      closedAt: this.closedAt,
      inputEntropy: this.inputEntropy,
      tensionScore: this.tensionScore,
      learningPressure: this.learningPressure,
      resonantLoops: this.resonantLoops,
      meaningScore: this.meaningScore,
      dominantLayer: this.dominantLayer,
      meaningEmbeddings: this.meaningEmbeddings
    };
  }
}

// ─────────────────────────────────────────────
// FEEDBACK VAULT
// ─────────────────────────────────────────────

class FeedbackVault {
  constructor(filePath) {
    this.filePath = filePath;
    this.loops = [];
    this.totalLoopsEver = 0;
    this.load();
    // Seed TF-IDF corpus from existing vault
    for (const l of this.loops) {
      globalTFIDF.addDocument((l.input || "") + " " + (l.resolution || ""));
    }
  }

  store(entry) {
    this.loops.push(entry);
    this.totalLoopsEver += 1;
    globalTFIDF.addDocument((entry.input || "") + " " + (entry.resolution || ""));
    this.save();
    return entry;
  }

  retrieve(input, count = 8) {
    return [...this.loops]
      .map(l => ({
        ...l,
        relevance: round(
          globalTFIDF.similarity(input, (l.input || "") + " " + (l.resolution || "")) * 0.5 +
          (l.meaningScore || 0) * 0.25 +
          (l.learningPressure || 0) * 0.25
        )
      }))
      .filter(l => l.relevance > 0)
      .sort((a, b) => b.relevance - a.relevance)
      .slice(0, count);
  }

  highTensionZones(count = 5) {
    return [...this.loops]
      .sort((a, b) => (b.tensionScore || 0) - (a.tensionScore || 0))
      .slice(0, count)
      .map(l => ({ id: l.id, input: l.input.slice(0, 80), tensionScore: l.tensionScore, dominantLayer: l.dominantLayer }));
  }

  snapshot() { return this.loops.slice(-50); }

  summary() {
    const avg = key => this.loops.length
      ? round(this.loops.reduce((s, l) => s + (l[key] || 0), 0) / this.loops.length) : 0;
    const layerCounts = {};
    for (const l of this.loops) {
      if (l.dominantLayer) layerCounts[l.dominantLayer] = (layerCounts[l.dominantLayer] || 0) + 1;
    }
    return {
      totalLoops: this.loops.length,
      totalLoopsEver: this.totalLoopsEver,
      avgTension: avg("tensionScore"),
      avgEntropy: avg("inputEntropy"),
      avgMeaningScore: avg("meaningScore"),
      dominantLayers: layerCounts,
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
    } catch { }
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

// ─────────────────────────────────────────────
// PROJECT UNKNOWN — MAIN ENGINE
// ─────────────────────────────────────────────

export class ProjectUnknown {
  constructor(options = {}) {
    this.filePath = options.filePath || process.env.PROJECT_UNKNOWN_PATH || "data/project_unknown.local.json";
    this.vault = new FeedbackVault(this.filePath);
    this.identity = {
      name: "Project Unknown",
      version: "0.2.0",
      concept: "Every thought is its own feedback loop. Seven semantic models process each thought. The loop splits into a vault entry and an agent signal. The vault is the intelligence.",
      semanticLayers: Object.keys(SEMANTIC_MODELS),
      createdAt: "2026-05-30"
    };
  }

  /**
   * THE CORE MECHANIC.
   *
   * Input enters.
   * A ThoughtLoop opens.
   * Seven semantic models run in parallel.
   * The unified meaning loop fuses their outputs.
   * TWO things come out:
   *   1. Vault entry — stored permanently
   *   2. Agent signal — pushed to caller for response
   */
  think(input) {
    const vaultSnapshot = this.vault.snapshot();
    const loop = new ThoughtLoop(input, vaultSnapshot);

    // Run all seven semantic models + unify
    const meaningResult = runUnifiedMeaningLoop(input, loop.id);

    // Retrieve relevant prior experience from vault using TF-IDF
    const retrieved = this.vault.retrieve(input, 5);

    // Build vault resolution — full fidelity record
    const vaultResolution = [
      `Seven-layer semantic analysis complete.`,
      `Dominant meaning layer: ${meaningResult.vaultPayload.dominantLayer} (${SEMANTIC_MODELS[meaningResult.vaultPayload.dominantLayer]?.description}).`,
      `Meaning score: ${meaningResult.vaultPayload.meaningScore}.`,
      `Tension: ${loop.tensionScore}. Entropy: ${loop.inputEntropy}. Learning pressure: ${loop.learningPressure}.`,
      retrieved.length
        ? `Vault resonance: ${retrieved.length} prior loop(s). Strongest: "${retrieved[0]?.input?.slice(0, 60)}" (relevance: ${retrieved[0]?.relevance}).`
        : `Vault resonance: none. This is new territory.`
    ].join(" ");

    // Resolve the loop — splits into vault entry and agent signal
    const vaultEntry = loop.resolve(vaultResolution, meaningResult);

    // Store permanently
    this.vault.store(vaultEntry);

    return {
      identity: this.identity,
      // AGENT SIGNAL — what the agent uses to answer
      agentSignal: meaningResult.agentSignal,
      // VAULT ENTRY — what was stored permanently
      vaultEntry: {
        id: vaultEntry.id,
        dominantLayer: vaultEntry.dominantLayer,
        meaningScore: vaultEntry.meaningScore,
        tensionScore: vaultEntry.tensionScore,
        resolution: vaultEntry.resolution
      },
      retrieved,
      vault: this.vault.summary()
    };
  }

  status() {
    return {
      identity: this.identity,
      vault: this.vault.summary()
    };
  }

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
