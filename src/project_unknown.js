/**
 * PROJECT UNKNOWN
 * The premise of the whole system.
 *
 * Instead of one permanent feedback loop,
 * every thought creates its own feedback loop.
 * Each loop processes through seven semantic models.
 * Each loop resolves and stores itself permanently in the vault.
 * The vault is the intelligence. It grows forever.
 *
 * The seven semantic models are not separate —
 * they are the working parts of the brain.
 * They feed the elemental loops.
 * They inform focus decisions.
 * They enrich memory.
 * They evolve the training weights.
 *
 * Conceived: May 30, 2026
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

export function nowISO() { return new Date().toISOString(); }
export function uid() { return `loop_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`; }
export function roundN(v) { return Math.round(v * 100000) / 100000; }
export function clampN(v, lo = 0, hi = 1) { return Math.max(lo, Math.min(hi, v)); }

export function tokenize(text) {
  return String(text || "").toLowerCase().replace(/[^a-z0-9\s-]/g, " ").split(/\s+/).filter(Boolean);
}

// ── TF-IDF ENGINE ─────────────────────────────────────────
// Smarter retrieval — rare meaningful words carry more weight.

export class TFIDF {
  constructor() { this.corpus = []; this.dfCache = new Map(); }

  addDocument(text) {
    this.corpus.push(tokenize(text));
    this.dfCache.clear();
  }

  df(term) {
    if (this.dfCache.has(term)) return this.dfCache.get(term);
    const count = this.corpus.filter(doc => doc.includes(term)).length;
    this.dfCache.set(term, count);
    return count;
  }

  tf(term, tokens) {
    return tokens.length ? tokens.filter(t => t === term).length / tokens.length : 0;
  }

  idf(term) {
    const N = this.corpus.length || 1;
    return Math.log((N + 1) / ((this.df(term) || 0) + 1)) + 1;
  }

  vectorize(text) {
    const tokens = tokenize(text);
    const vec = new Map();
    for (const term of new Set(tokens)) vec.set(term, this.tf(term, tokens) * this.idf(term));
    return vec;
  }

  similarity(textA, textB) {
    const va = this.vectorize(textA);
    const vb = this.vectorize(textB);
    let dot = 0, magA = 0, magB = 0;
    for (const [t, v] of va) { dot += v * (vb.get(t) || 0); magA += v * v; }
    for (const v of vb.values()) magB += v * v;
    const d = Math.sqrt(magA) * Math.sqrt(magB);
    return d ? roundN(dot / d) : 0;
  }
}

export const globalTFIDF = new TFIDF();

// ── SEVEN SEMANTIC MODELS ─────────────────────────────────
// Each is an independent working part of the brain.
// Together they give every thought a seven-layer meaning vector.

export const SEMANTIC_MODELS = {

  conceptual: {
    id: "conceptual",
    description: "Denotative meaning — what the words literally refer to",
    elementAffinity: "earth",  // Earth processes literal structure
    vocab: ["define","means","is","refers","concept","object","entity","thing","what","type","kind","category","class","form","structure","function","purpose","system","process","state","condition","property","attribute","relation"],
    encode(text) {
      const tokens = tokenize(text);
      const set = new Set(tokens);
      let score = 0;
      for (const term of this.vocab) if (set.has(term)) score++;
      const uniqueness = new Set(tokens).size / (tokens.length || 1);
      return { model: this.id, elementAffinity: this.elementAffinity, score: roundN(clampN(score / this.vocab.length + uniqueness * 0.2)), dominantTokens: tokens.slice(0, 6), signal: `Conceptual density: ${roundN(score / (this.vocab.length || 1))}. Lexical uniqueness: ${roundN(uniqueness)}.` };
    }
  },

  connotative: {
    id: "connotative",
    description: "Emotional and cultural associations beyond literal meaning",
    elementAffinity: "water",  // Water reads emotional current
    positiveMarkers: ["hope","love","safe","trust","warm","bright","good","free","peace","joy","strong","grow","heal","open","light"],
    negativeMarkers: ["danger","fear","dark","threat","death","pain","trap","cold","fail","weak","broken","lost","shame","hate","war"],
    encode(text) {
      const tokens = tokenize(text);
      const set = new Set(tokens);
      let pos = 0, neg = 0;
      for (const t of this.positiveMarkers) if (set.has(t)) pos++;
      for (const t of this.negativeMarkers) if (set.has(t)) neg++;
      const polarity = roundN((pos - neg) / (pos + neg + 1));
      return { model: this.id, elementAffinity: this.elementAffinity, score: roundN(clampN((pos + neg) / 6)), polarity, signal: `Connotative charge: ${pos + neg}. Polarity: ${polarity > 0 ? "positive" : polarity < 0 ? "negative" : "neutral"} (${polarity}).` };
    }
  },

  collocative: {
    id: "collocative",
    description: "Word combination patterns and collocations",
    elementAffinity: "air",  // Air maps language patterns
    knownPairs: [["strong","coffee"],["strong","wind"],["strong","support"],["build","system"],["build","trust"],["break","down"],["take","action"],["make","sense"],["move","forward"],["high","risk"],["deep","learning"],["open","source"],["feedback","loop"],["neural","network"],["weight","update"],["long","term"],["short","term"],["real","time"]],
    encode(text) {
      const tokens = tokenize(text);
      const set = new Set(tokens);
      let hits = 0;
      const matched = [];
      for (const [a, b] of this.knownPairs) if (set.has(a) && set.has(b)) { hits++; matched.push(`${a}+${b}`); }
      const bigrams = [];
      for (let i = 0; i < tokens.length - 1; i++) bigrams.push(`${tokens[i]}+${tokens[i+1]}`);
      return { model: this.id, elementAffinity: this.elementAffinity, score: roundN(clampN(hits / 3 + bigrams.length / 40)), matchedPairs: matched, signal: `Collocative hits: ${hits}. Matched: ${matched.join(", ") || "none"}. Bigrams: ${bigrams.length}.` };
    }
  },

  affective: {
    id: "affective",
    description: "Emotional charge and arousal level",
    elementAffinity: "fire",  // Fire reads urgency and arousal
    highArousal: ["urgent","panic","excited","angry","scared","thrilled","furious","desperate","overwhelm","intense"],
    lowArousal: ["calm","quiet","slow","gentle","still","rest","peace","soft","steady","easy"],
    encode(text) {
      const tokens = tokenize(text);
      const set = new Set(tokens);
      let high = 0, low = 0;
      for (const t of this.highArousal) if (set.has(t)) high++;
      for (const t of this.lowArousal) if (set.has(t)) low++;
      const arousal = roundN((high - low) / (high + low + 1));
      return { model: this.id, elementAffinity: this.elementAffinity, score: roundN(clampN((high + low) / 5)), arousal, signal: `Affective arousal: ${arousal > 0.2 ? "high" : arousal < -0.2 ? "low" : "neutral"} (${arousal}).` };
    }
  },

  social: {
    id: "social",
    description: "Social power, formality, and relational role",
    elementAffinity: "water",  // Water also reads relational signals
    formalMarkers: ["please","sir","doctor","professor","formally","respectfully","dear","hereby","pursuant","shall"],
    informalMarkers: ["hey","yeah","dude","gonna","wanna","kinda","stuff","cool","ok","nah"],
    powerMarkers: ["must","authority","order","command","force","control","demand","require","enforce"],
    encode(text) {
      const tokens = tokenize(text);
      const set = new Set(tokens);
      let formal = 0, informal = 0, power = 0;
      for (const t of this.formalMarkers) if (set.has(t)) formal++;
      for (const t of this.informalMarkers) if (set.has(t)) informal++;
      for (const t of this.powerMarkers) if (set.has(t)) power++;
      const register = formal > informal ? "formal" : informal > formal ? "informal" : "neutral";
      return { model: this.id, elementAffinity: this.elementAffinity, score: roundN(clampN((formal + informal + power) / 6)), register, powerLevel: roundN(power / (this.powerMarkers.length || 1)), signal: `Social register: ${register}. Power: ${power}. Formal: ${formal}. Informal: ${informal}.` };
    }
  },

  reflected: {
    id: "reflected",
    description: "Implied attitude, belief, and speaker stance",
    elementAffinity: "ether",  // Ether reads meta-signals and belief
    certaintyMarkers: ["obviously","clearly","certainly","definitely","always","never","must","will","know"],
    uncertaintyMarkers: ["maybe","perhaps","might","could","possibly","uncertain","unclear","wonder","guess","think"],
    beliefMarkers: ["believe","feel","think","sense","assume","expect","trust","doubt","suspect"],
    encode(text) {
      const tokens = tokenize(text);
      const set = new Set(tokens);
      let certain = 0, uncertain = 0, belief = 0;
      for (const t of this.certaintyMarkers) if (set.has(t)) certain++;
      for (const t of this.uncertaintyMarkers) if (set.has(t)) uncertain++;
      for (const t of this.beliefMarkers) if (set.has(t)) belief++;
      const stance = certain > uncertain ? "assertive" : uncertain > certain ? "tentative" : "neutral";
      return { model: this.id, elementAffinity: this.elementAffinity, score: roundN(clampN((certain + uncertain + belief) / 8)), stance, beliefDensity: roundN(belief / (tokens.length || 1)), signal: `Reflected stance: ${stance}. Certainty: ${certain}. Uncertainty: ${uncertain}. Belief: ${belief}.` };
    }
  },

  thematic: {
    id: "thematic",
    description: "Topic structure — theme and information flow",
    elementAffinity: "air",  // Air maps structure and routes
    encode(text) {
      const tokens = tokenize(text);
      if (!tokens.length) return { model: this.id, elementAffinity: this.elementAffinity, score: 0, theme: null, rheme: null, signal: "Empty input." };
      const stopwords = new Set(["the","a","an","is","are","was","were","it","in","on","at","to","of","and","or","but","i","you","we"]);
      const meaningful = tokens.filter(t => !stopwords.has(t));
      const split = Math.ceil(meaningful.length * 0.35);
      const theme = meaningful.slice(0, split).slice(0, 4).join(" ");
      const rheme = meaningful.slice(split).slice(0, 6).join(" ");
      const topicDensity = roundN(meaningful.length / (tokens.length || 1));
      return { model: this.id, elementAffinity: this.elementAffinity, score: roundN(clampN(topicDensity)), theme: theme || null, rheme: rheme || null, signal: `Theme: "${theme}". Rheme: "${rheme}". Topic density: ${topicDensity}.` };
    }
  }
};

// ── UNIFIED MEANING LOOP ──────────────────────────────────
// Runs all seven models. Fuses outputs.
// Returns vault payload + agent signal.

export function runSevenLayers(input, loopId) {
  const embeddings = {};
  let totalScore = 0;
  const signals = [];

  // Element affinity scores — which elements does this meaning pull toward
  const elementPull = { fire: 0, earth: 0, water: 0, air: 0, ether: 0 };

  for (const [key, model] of Object.entries(SEMANTIC_MODELS)) {
    const result = model.encode(input);
    embeddings[key] = result;
    signals.push(result.signal);
    totalScore += result.score || 0;
    // Each model votes for its affinity element based on its score
    if (model.elementAffinity && result.score > 0) {
      elementPull[model.elementAffinity] = roundN((elementPull[model.elementAffinity] || 0) + result.score);
    }
  }

  const meaningScore = roundN(totalScore / Object.keys(SEMANTIC_MODELS).length);
  const dominant = Object.entries(embeddings).sort((a, b) => (b[1].score || 0) - (a[1].score || 0))[0];

  // Which element does this thought most belong to
  const suggestedElement = Object.entries(elementPull).sort((a, b) => b[1] - a[1])[0][0];

  return {
    // VAULT PAYLOAD — full fidelity, stored permanently
    vaultPayload: { loopId, input, embeddings, meaningScore, dominantLayer: dominant[0], elementPull, signals },
    // AGENT SIGNAL — compressed, actionable, pushed to the agent
    agentSignal: {
      loopId,
      meaningScore,
      dominantLayer: dominant[0],
      dominantDescription: SEMANTIC_MODELS[dominant[0]]?.description,
      suggestedElement,
      elementPull,
      affectiveArousal: embeddings.affective?.arousal,
      socialRegister: embeddings.social?.register,
      reflectedStance: embeddings.reflected?.stance,
      connotativePolarity: embeddings.connotative?.polarity,
      theme: embeddings.thematic?.theme,
      summary: signals.join(" | ")
    }
  };
}

// ── FEEDBACK VAULT ────────────────────────────────────────
// Every resolved thought-loop stored permanently.
// Never shrinks. Only grows.
// The intelligence lives here.

export class FeedbackVault {
  constructor(filePath) {
    this.filePath = filePath;
    this.loops = [];
    this.totalLoopsEver = 0;
    this.load();
    for (const l of this.loops) globalTFIDF.addDocument((l.input || "") + " " + (l.resolution || ""));
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
      .map(l => ({ ...l, relevance: roundN(globalTFIDF.similarity(input, (l.input || "") + " " + (l.resolution || "")) * 0.5 + (l.meaningScore || 0) * 0.25 + (l.learningPressure || 0) * 0.25) }))
      .filter(l => l.relevance > 0)
      .sort((a, b) => b.relevance - a.relevance)
      .slice(0, count);
  }

  snapshot() { return this.loops.slice(-50); }

  summary() {
    const avg = key => this.loops.length ? roundN(this.loops.reduce((s, l) => s + (l[key] || 0), 0) / this.loops.length) : 0;
    const layerCounts = {};
    for (const l of this.loops) if (l.dominantLayer) layerCounts[l.dominantLayer] = (layerCounts[l.dominantLayer] || 0) + 1;
    return { totalLoops: this.loops.length, totalLoopsEver: this.totalLoopsEver, avgTension: avg("tensionScore"), avgEntropy: avg("inputEntropy"), avgMeaningScore: avg("meaningScore"), dominantLayers: layerCounts };
  }

  save() {
    if (!this.filePath) return;
    try {
      mkdirSync(path.dirname(this.filePath), { recursive: true });
      writeFileSync(this.filePath, JSON.stringify({ savedAt: nowISO(), totalLoopsEver: this.totalLoopsEver, loops: this.loops }, null, 2));
    } catch { }
  }

  load() {
    if (!this.filePath || !existsSync(this.filePath)) return;
    try {
      const raw = JSON.parse(readFileSync(this.filePath, "utf8"));
      this.loops = Array.isArray(raw.loops) ? raw.loops : [];
      this.totalLoopsEver = raw.totalLoopsEver || this.loops.length;
    } catch { this.loops = []; this.totalLoopsEver = 0; }
  }
}

// ── THOUGHT LOOP ──────────────────────────────────────────
// One thought. One loop. Self-contained.
// Opens, runs seven semantic models, resolves, stores, closes.

function inputEntropy(text) {
  const tokens = tokenize(text);
  if (!tokens.length) return 0;
  const freq = new Map();
  for (const t of tokens) freq.set(t, (freq.get(t) || 0) + 1);
  let h = 0;
  for (const c of freq.values()) { const p = c / tokens.length; h -= p * Math.log2(p); }
  return roundN(h);
}

export class ThoughtLoop {
  constructor(input, vaultSnapshot) {
    this.id = uid();
    this.input = input;
    this.openedAt = nowISO();
    this.entropy = inputEntropy(input);
    this.resonantLoops = vaultSnapshot
      .map(l => ({ id: l.id, relevance: roundN(globalTFIDF.similarity(input, (l.input || "") + " " + (l.resolution || ""))) }))
      .filter(l => l.relevance > 0)
      .sort((a, b) => b.relevance - a.relevance)
      .slice(0, 5);
    const avgRel = this.resonantLoops.length ? this.resonantLoops.reduce((s, l) => s + l.relevance, 0) / this.resonantLoops.length : 0;
    this.tensionScore = roundN(1 - avgRel);
    this.learningPressure = roundN(clampN(this.tensionScore * 0.6 + Math.min(this.entropy, 4) / 4 * 0.4));
  }

  resolve(resolution, meaningResult) {
    this.resolution = resolution;
    this.closedAt = nowISO();
    return {
      id: this.id,
      input: this.input,
      resolution,
      openedAt: this.openedAt,
      closedAt: this.closedAt,
      inputEntropy: this.entropy,
      tensionScore: this.tensionScore,
      learningPressure: this.learningPressure,
      resonantLoops: this.resonantLoops,
      meaningScore: meaningResult.vaultPayload.meaningScore,
      dominantLayer: meaningResult.vaultPayload.dominantLayer,
      suggestedElement: meaningResult.agentSignal.suggestedElement,
      elementPull: meaningResult.vaultPayload.elementPull,
      meaningEmbeddings: meaningResult.vaultPayload.embeddings
    };
  }
}

// ── PROJECT UNKNOWN — MAIN ENGINE ────────────────────────
// The premise of everything.
// Every thought is its own feedback loop.
// Seven semantic models are the working parts of the brain.
// The vault is the intelligence.

export class ProjectUnknown {
  constructor(options = {}) {
    this.filePath = options.filePath || process.env.PROJECT_UNKNOWN_PATH || "data/project_unknown.local.json";
    this.vault = new FeedbackVault(this.filePath);
    this.identity = {
      name: "Project Unknown",
      version: "0.3.0",
      premise: "Every thought is its own feedback loop. Seven semantic models are the working parts of the brain. The vault grows forever. The intelligence is the vault.",
      semanticLayers: Object.keys(SEMANTIC_MODELS),
      createdAt: "2026-05-30"
    };
  }

  think(input) {
    const snapshot = this.vault.snapshot();
    const loop = new ThoughtLoop(input, snapshot);
    const meaning = runSevenLayers(input, loop.id);
    const retrieved = this.vault.retrieve(input, 5);

    const resolution = [
      `Seven-layer analysis complete. Dominant: ${meaning.vaultPayload.dominantLayer}.`,
      `Suggested element: ${meaning.agentSignal.suggestedElement}. Meaning score: ${meaning.vaultPayload.meaningScore}.`,
      `Tension: ${loop.tensionScore}. Learning pressure: ${loop.learningPressure}.`,
      retrieved.length
        ? `Vault resonance: ${retrieved.length} prior loop(s). Strongest: "${retrieved[0]?.input?.slice(0, 60)}" (${retrieved[0]?.relevance}).`
        : `No prior vault resonance. This is new territory.`
    ].join(" ");

    const entry = loop.resolve(resolution, meaning);
    this.vault.store(entry);

    return {
      identity: this.identity,
      agentSignal: meaning.agentSignal,
      vaultEntry: { id: entry.id, dominantLayer: entry.dominantLayer, suggestedElement: entry.suggestedElement, meaningScore: entry.meaningScore, tensionScore: entry.tensionScore },
      retrieved,
      vault: this.vault.summary()
    };
  }

  status() { return { identity: this.identity, vault: this.vault.summary() }; }
  recall(query, count = 8) { return { query, results: this.vault.retrieve(query, count), vaultSize: this.vault.loops.length }; }
  reset() { this.vault.loops = []; this.vault.totalLoopsEver = 0; this.vault.save(); return this.status(); }
}
