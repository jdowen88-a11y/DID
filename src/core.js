import { ELEMENTAL_LOOPS, LOOP_IDS } from "./loops.js";

const clamp = (value, min = 0, max = 1) => Math.max(min, Math.min(max, value));
const round = (value) => Math.round(value * 1000) / 1000;

function tokens(input) {
  return String(input || "").toLowerCase().replace(/[^a-z0-9\s-]/g, " ").split(/\s+/).filter(Boolean);
}

export class ElementalCore {
  constructor() { this.reset(); }

  reset() {
    this.tickCount = 0;
    this.values = Object.fromEntries(LOOP_IDS.map((id) => [id, ELEMENTAL_LOOPS[id].baseline]));
    this.amplification = Object.fromEntries(LOOP_IDS.map((id) => [id, 1]));
    this.links = Object.fromEntries(LOOP_IDS.map((id) => [id, Object.fromEntries(LOOP_IDS.filter((other) => other !== id).map((other) => [other, 0]))]));
    this.events = [];
    this.signals = [];
    this.memory = [];
    return this.status();
  }

  status() {
    return {
      title: "Elemental Dialogue Field",
      mode: "five-loop simultaneous allowance field",
      tickCount: this.tickCount,
      loops: LOOP_IDS.map((id) => ({ ...ELEMENTAL_LOOPS[id], activation: round(this.values[id]), amplification: this.amplification[id] })),
      links: this.links,
      events: this.events,
      memory: this.memory.slice(-10)
    };
  }

  scan() {
    return {
      tickCount: this.tickCount,
      activations: Object.fromEntries(LOOP_IDS.map((id) => [id, round(this.values[id])])),
      regions: LOOP_IDS.map((id) => ({
        id,
        label: ELEMENTAL_LOOPS[id].label,
        glyph: ELEMENTAL_LOOPS[id].glyph,
        color: ELEMENTAL_LOOPS[id].color,
        active: true,
        load: round(clamp(this.values[id] * this.amplification[id])),
        amplification: this.amplification[id],
        role: ELEMENTAL_LOOPS[id].role,
        description: ELEMENTAL_LOOPS[id].elementDescription
      })),
      signals: this.signals,
      events: this.events,
      links: this.links,
      memory: this.memory.slice(-10)
    };
  }

  tick(input = "") {
    this.tickCount += 1;
    const text = String(input || "").toLowerCase();
    const list = tokens(input);
    const scores = this.score(list, text);
    const ranked = LOOP_IDS.map((id) => ({ id, score: scores[id] })).sort((a, b) => b.score - a.score);

    this.values = Object.fromEntries(LOOP_IDS.map((id) => [id, round(scores[id])]));
    this.events = [{ type: "simultaneous_field", loops: [...LOOP_IDS], note: "All voices remain present. Ranking describes signal strength only; it grants no authority." }];

    this.updateLinks(ranked);
    this.signals = LOOP_IDS.map((id) => this.makeSignal(id, scores[id]));
    const voices = LOOP_IDS.map((id) => this.speak(id, input, ranked));

    this.memory.push({ tick: this.tickCount, input, voices, ranked, events: this.events, createdAt: new Date().toISOString() });
    if (this.memory.length > 60) this.memory.shift();

    return { ...this.scan(), voices, ranked: ranked.map((item) => ({ id: item.id, score: round(item.score) })) };
  }

  amplify(loop = "ether", amount = 1.25, reason = "manual amplification") {
    if (!LOOP_IDS.includes(loop)) return { error: "Unknown loop", validLoops: LOOP_IDS };
    const next = clamp(Number(amount) || 1.25, 0.25, 2);
    this.amplification[loop] = next;
    this.events = [{ type: "voice_amplified", loop, amount: next, reason, note: "Amplification never mutes another voice." }];
    return this.scan();
  }

  setFocus(loop = "ether", reason = "compatibility amplification") {
    return this.amplify(loop, 1.25, reason);
  }

  score(list, text) {
    const set = new Set(list);
    const scores = {};
    for (const id of LOOP_IDS) {
      const loop = ELEMENTAL_LOOPS[id];
      let value = loop.baseline + Math.min(list.length / 360, 0.08);
      for (const keyword of loop.keywords) {
        const hit = keyword.includes(" ") ? text.includes(keyword) : set.has(keyword);
        if (hit) value += 0.11;
      }
      value += Object.values(this.links[id]).reduce((sum, next) => sum + next, 0) / 120;
      scores[id] = clamp(value);
    }
    return scores;
  }

  updateLinks(ranked) {
    for (let i = 0; i < ranked.length; i++) {
      for (let j = i + 1; j < ranked.length; j++) {
        const a = ranked[i];
        const b = ranked[j];
        const closeness = 1 - Math.abs(a.score - b.score);
        if (closeness > 0.82) {
          this.links[a.id][b.id] = round(clamp(this.links[a.id][b.id] + 0.07));
          this.links[b.id][a.id] = round(clamp(this.links[b.id][a.id] + 0.07));
          this.events.push({ type: "resonance_link", loops: [a.id, b.id], intensity: round(closeness) });
        }
      }
    }
  }

  makeSignal(id, score) {
    const loop = ELEMENTAL_LOOPS[id];
    return {
      id,
      label: loop.label,
      glyph: loop.glyph,
      color: loop.color,
      activation: round(score),
      channel: "present",
      text: `${loop.label} is present and speaking through its own lens.`
    };
  }

  speak(id, input, ranked) {
    const loop = ELEMENTAL_LOOPS[id];
    const neighbor = ranked.find((item) => item.id !== id);
    const frames = {
      fire: "Name the motion that is alive here.",
      earth: "Give the signal a durable form without reducing it.",
      water: "Read the current and preserve connection.",
      air: "Open alternate names, maps, and routes.",
      ether: "Hold the whole field without collapsing its differences."
    };
    return {
      loop: id,
      label: loop.label,
      glyph: loop.glyph,
      style: loop.voice,
      activation: round(this.values[id]),
      text: `${loop.glyph} ${loop.label}: ${frames[id]} Input: “${String(input || "").slice(0, 180)}”. Neighbor signal: ${neighbor?.id || "none"}.`
    };
  }
}
