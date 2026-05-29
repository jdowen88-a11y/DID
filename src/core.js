import { ELEMENTAL_LOOPS, LOOP_IDS } from "./loops.js";

const clamp = (value, min = 0, max = 1) => Math.max(min, Math.min(max, value));
const round = (value) => Math.round(value * 1000) / 1000;

function tokens(input) {
  return String(input || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
}

export class ElementalCore {
  constructor() {
    this.reset();
  }

  reset() {
    this.tickCount = 0;
    this.focus = "ether";
    this.values = Object.fromEntries(LOOP_IDS.map((id) => [id, ELEMENTAL_LOOPS[id].baseline]));
    this.links = Object.fromEntries(
      LOOP_IDS.map((id) => [id, Object.fromEntries(LOOP_IDS.filter((other) => other !== id).map((other) => [other, 0]))])
    );
    this.events = [];
    this.signals = [];
    this.memory = [];
    return this.status();
  }

  status() {
    return {
      title: "Elemental Dialogue Lab",
      mode: "five-loop reasoning sandbox",
      tickCount: this.tickCount,
      focus: this.focus,
      loops: LOOP_IDS.map((id) => ({ ...ELEMENTAL_LOOPS[id], activation: round(this.values[id]) })),
      links: this.links,
      events: this.events,
      memory: this.memory.slice(-10)
    };
  }

  scan() {
    return {
      tickCount: this.tickCount,
      focus: this.focus,
      activations: Object.fromEntries(LOOP_IDS.map((id) => [id, round(this.values[id])])),
      regions: LOOP_IDS.map((id) => ({
        id,
        label: ELEMENTAL_LOOPS[id].label,
        glyph: ELEMENTAL_LOOPS[id].glyph,
        color: ELEMENTAL_LOOPS[id].color,
        active: this.focus === id,
        load: round(clamp(this.values[id] * (this.focus === id ? 1.2 : 0.75))),
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

    this.values = Object.fromEntries(LOOP_IDS.map((id) => [id, round(scores[id])])) ;
    this.events = [];

    const leader = ranked[0];
    const previous = this.focus;
    const margin = leader.score - scores[previous];
    const requested = text.includes("spotlight") || text.includes("take point") || text.includes("override");

    if (leader.id !== previous && (margin > 0.16 || requested)) {
      this.focus = leader.id;
      this.events.push({ type: "focus_handoff", from: previous, to: leader.id, intensity: round(margin) });
    } else {
      this.events.push({ type: "focus_hold", holder: previous, challenger: leader.id, margin: round(margin) });
    }

    this.updateLinks(ranked);
    this.signals = LOOP_IDS.map((id) => this.makeSignal(id, scores[id]));

    const spoken = this.speak(this.focus, input, ranked);
    this.memory.push({ tick: this.tickCount, input, focus: this.focus, ranked, spoken, events: this.events, createdAt: new Date().toISOString() });
    if (this.memory.length > 60) this.memory.shift();

    return { ...this.scan(), spoken, ranked: ranked.map((item) => ({ id: item.id, score: round(item.score) })) };
  }

  setFocus(loop = "ether", reason = "manual dashboard handoff") {
    if (!LOOP_IDS.includes(loop)) return { error: "Unknown loop", validLoops: LOOP_IDS };
    const from = this.focus;
    this.focus = loop;
    this.values[loop] = clamp(this.values[loop] + 0.2);
    this.events = [{ type: "manual_focus_handoff", from, to: loop, reason }];
    return this.scan();
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
    const first = ranked[0];
    const second = ranked[1];
    if (!first || !second) return;
    const closeness = 1 - Math.abs(first.score - second.score);
    if (closeness > 0.82) {
      this.links[first.id][second.id] = round(clamp(this.links[first.id][second.id] + 0.1));
      this.links[second.id][first.id] = round(clamp(this.links[second.id][first.id] + 0.07));
      this.events.push({ type: "resonance_link", loops: [first.id, second.id], intensity: round(closeness) });
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
      channel: id === this.focus ? "focus" : "background",
      text: id === this.focus ? `${loop.label} is speaking.` : `${loop.label} is running a background pass.`
    };
  }

  speak(id, input, ranked) {
    const loop = ELEMENTAL_LOOPS[id];
    const second = ranked.find((item) => item.id !== id);
    const frames = {
      fire: "Choose motion and reduce hesitation.",
      earth: "Create structure and verify the next brick.",
      water: "Read the emotional current and repair the flow.",
      air: "Map the language and test alternate routes.",
      ether: "Integrate the signals into one coherent direction."
    };

    return {
      loop: id,
      label: loop.label,
      glyph: loop.glyph,
      style: loop.voice,
      text: `${loop.glyph} ${loop.label}: ${frames[id]} Input: “${String(input || "").slice(0, 180)}”. Secondary signal: ${second?.id || "none"}.`
    };
  }
}
