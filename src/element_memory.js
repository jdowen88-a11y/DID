import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

function now() {
  return new Date().toISOString();
}

function clean(value) {
  return String(value || "").trim();
}

function tokenize(text) {
  return clean(text).toLowerCase().replace(/[^a-z0-9\s-]/g, " ").split(/\s+/).filter(Boolean);
}

function overlapScore(a, b) {
  const left = new Set(tokenize(a));
  const right = new Set(tokenize(b));
  if (!left.size || !right.size) return 0;
  let hits = 0;
  for (const token of left) if (right.has(token)) hits += 1;
  return hits / Math.max(left.size, right.size);
}

export class ElementMemory {
  constructor(options = {}) {
    this.limit = options.limit || 500;
    this.filePath = options.filePath || process.env.ELEMENT_MEMORY_PATH || "data/element_memory.local.json";
    this.traces = [];
    this.load();
  }

  load() {
    if (!this.filePath || !existsSync(this.filePath)) return;
    try {
      const raw = JSON.parse(readFileSync(this.filePath, "utf8"));
      this.traces = Array.isArray(raw.traces) ? raw.traces.slice(-this.limit) : [];
    } catch {
      this.traces = [];
    }
  }

  save() {
    if (!this.filePath) return;
    mkdirSync(path.dirname(this.filePath), { recursive: true });
    writeFileSync(this.filePath, JSON.stringify({ savedAt: now(), traces: this.traces }, null, 2));
  }

  reset() {
    this.traces = [];
    this.save();
  }

  add(trace) {
    const item = {
      id: `mem_${String(this.traces.length + 1).padStart(5, "0")}`,
      at: now(),
      input: clean(trace.input),
      focus: trace.focus || "ether",
      neuralWinner: trace.neuralWinner || trace.neuralPrediction?.label || "unknown",
      reply: clean(trace.reply?.text || trace.reply || ""),
      importance: this.importance(trace)
    };
    this.traces.push(item);
    if (this.traces.length > this.limit) this.traces.shift();
    this.save();
    return item;
  }

  importance(trace) {
    const text = `${trace.input || ""} ${trace.reply?.text || trace.reply || ""}`.toLowerCase();
    let score = 0.2;
    if (text.includes("repo") || text.includes("build") || text.includes("code")) score += 0.2;
    if (text.includes("remember") || text.includes("memory")) score += 0.2;
    if (text.includes("element") || text.includes("neural")) score += 0.2;
    if (text.length > 240) score += 0.1;
    return Math.min(1, Math.round(score * 1000) / 1000);
  }

  recent(count = 8) {
    return this.traces.slice(-count);
  }

  recall(query, count = 5) {
    return [...this.traces]
      .map((trace) => ({ ...trace, relevance: Math.round(overlapScore(query, `${trace.input} ${trace.reply}`) * 1000) / 1000 }))
      .filter((trace) => trace.relevance > 0)
      .sort((a, b) => b.relevance - a.relevance || b.importance - a.importance)
      .slice(0, count);
  }

  summary() {
    const focusCounts = {};
    const neuralCounts = {};
    for (const trace of this.traces) {
      focusCounts[trace.focus] = (focusCounts[trace.focus] || 0) + 1;
      neuralCounts[trace.neuralWinner] = (neuralCounts[trace.neuralWinner] || 0) + 1;
    }
    return {
      count: this.traces.length,
      filePath: this.filePath,
      focusCounts,
      neuralCounts,
      recent: this.recent(5)
    };
  }
}
