export const ELEMENTAL_LOOPS = {
  fire: {
    id: "fire", label: "Fire", glyph: "🔥", color: "#ff6b35",
    role: "motion and protection",
    elementDescription: "Heat, ignition, protection, motion, courage, direct expression.",
    voice: "fast, decisive, protective, vivid",
    strengths: ["decisive action", "momentum", "direct expression", "protection"],
    keywords: ["danger", "protect", "urgent", "attack", "defend", "force", "now", "risk", "panic", "fight", "threat", "ignite"],
    baseline: 0.22
  },
  earth: {
    id: "earth", label: "Earth", glyph: "🌍", color: "#6f8f4e",
    role: "structure and memory",
    elementDescription: "Weight, memory, ground, testing, proof, implementation, durable form.",
    voice: "measured, practical, grounded, concrete",
    strengths: ["structure", "memory", "evidence", "implementation"],
    keywords: ["proof", "build", "repo", "files", "test", "stable", "verify", "structure", "memory", "safe", "ground", "form"],
    baseline: 0.26
  },
  water: {
    id: "water", label: "Water", glyph: "💧", color: "#3a86ff",
    role: "feeling and continuity",
    elementDescription: "Flow, feeling, repair, relational signals, hidden currents, continuity.",
    voice: "relational, fluid, pattern-sensitive, connective",
    strengths: ["empathy", "tone reading", "continuity", "repair"],
    keywords: ["feel", "hurt", "afraid", "sad", "trust", "repair", "family", "care", "emotion", "water", "flow", "connect"],
    baseline: 0.20
  },
  air: {
    id: "air", label: "Air", glyph: "🌬️", color: "#a8dadc",
    role: "language and possibility",
    elementDescription: "Movement, language, abstraction, maps, hypotheses, naming, alternate routes.",
    voice: "quick, conceptual, inventive, reframing-oriented",
    strengths: ["strategy", "metaphor", "naming", "lateral motion"],
    keywords: ["idea", "strategy", "language", "explain", "abstract", "question", "map", "design", "why", "theory", "air", "possibility"],
    baseline: 0.24
  },
  ether: {
    id: "ether", label: "Ether", glyph: "✨", color: "#b388ff",
    role: "integration and field awareness",
    elementDescription: "Signal between signals, synthesis, coherence, long horizon, whole-field awareness.",
    voice: "wide-angle, reflective, integrative, coherence-seeking",
    strengths: ["meta-reasoning", "synthesis", "coherence", "long-horizon alignment"],
    keywords: ["meaning", "integrate", "synthesis", "infinity", "loop", "whole", "meta", "conscious", "system", "coherence", "ether", "field"],
    baseline: 0.28
  }
};

export const LOOP_IDS = Object.keys(ELEMENTAL_LOOPS);
