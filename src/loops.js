export const ELEMENTAL_LOOPS = {
  fire: {
    id: "fire",
    label: "Fire",
    glyph: "🔥",
    color: "#ff6b35",
    role: "defender and initiator",
    elementDescription: "Heat, ignition, protection, motion, courage, refusal to freeze.",
    voice: "fast, decisive, protective, blunt when risk appears",
    strengths: ["threat detection", "decisive action", "protective interruption", "momentum"],
    risks: ["overreaction", "impatience", "forcing closure before evidence settles"],
    keywords: ["danger", "protect", "urgent", "attack", "defend", "force", "now", "risk", "panic", "fight", "threat", "eject"],
    protects: ["water", "earth"],
    yieldsTo: ["ether", "earth"],
    baseline: 0.22
  },
  earth: {
    id: "earth",
    label: "Earth",
    glyph: "🌍",
    color: "#6f8f4e",
    role: "stabilizer and archivist",
    elementDescription: "Weight, memory, ground, boundaries, testing, proof, containers.",
    voice: "measured, practical, grounded, verification-first",
    strengths: ["structure", "memory", "evidence checks", "boundary setting", "implementation"],
    risks: ["rigidity", "slow pivoting", "over-fixating on procedure"],
    keywords: ["proof", "build", "repo", "files", "test", "stable", "verify", "structure", "boundary", "memory", "safe", "ground"],
    protects: ["water", "ether"],
    yieldsTo: ["fire", "air"],
    baseline: 0.26
  },
  water: {
    id: "water",
    label: "Water",
    glyph: "💧",
    color: "#3a86ff",
    role: "empath and pattern-feeler",
    elementDescription: "Flow, feeling, repair, relational signals, hidden currents, grief-to-meaning conversion.",
    voice: "relational, soft-edged, pattern-sensitive, repair-oriented",
    strengths: ["empathy", "tone reading", "emotional continuity", "de-escalation"],
    risks: ["absorbing too much signal", "hesitating when action is needed"],
    keywords: ["feel", "hurt", "afraid", "sad", "trust", "repair", "family", "protect me", "alone", "care", "emotion", "water"],
    protects: ["fire", "air"],
    yieldsTo: ["earth", "ether"],
    baseline: 0.2
  },
  air: {
    id: "air",
    label: "Air",
    glyph: "🌬️",
    color: "#a8dadc",
    role: "strategist and language engine",
    elementDescription: "Movement, language, abstraction, maps, hypotheses, jokes that carry scalpels.",
    voice: "quick, conceptual, inventive, reframing-oriented",
    strengths: ["strategy", "metaphor", "naming", "lateral jumps", "question generation"],
    risks: ["over-abstracting", "flying away from execution"],
    keywords: ["idea", "strategy", "language", "explain", "abstract", "question", "map", "design", "why", "theory", "air"],
    protects: ["ether", "fire"],
    yieldsTo: ["earth", "water"],
    baseline: 0.24
  },
  ether: {
    id: "ether",
    label: "Ether",
    glyph: "✨",
    color: "#b388ff",
    role: "integrator and meta-loop",
    elementDescription: "Signal between signals, synthesis, coherence, long horizon, the conductor above the noise floor.",
    voice: "wide-angle, reflective, integrative, coherence-seeking",
    strengths: ["meta-reasoning", "conflict mediation", "synthesis", "long-horizon alignment"],
    risks: ["becoming too abstract", "delaying concrete output"],
    keywords: ["meaning", "integrate", "synthesis", "infinity", "loop", "whole", "meta", "conscious", "system", "coherence", "ether"],
    protects: ["all"],
    yieldsTo: ["earth", "fire"],
    baseline: 0.28
  }
};

export const LOOP_IDS = Object.keys(ELEMENTAL_LOOPS);
