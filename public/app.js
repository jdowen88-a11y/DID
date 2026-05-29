const loopIds = ["fire", "earth", "water", "air", "ether"];
const glyphs = { fire: "🔥", earth: "🌍", water: "💧", air: "🌬️", ether: "✨" };

const els = {
  focusPill: document.querySelector("#focusPill"),
  tickCount: document.querySelector("#tickCount"),
  prompt: document.querySelector("#prompt"),
  sendBtn: document.querySelector("#sendBtn"),
  resetBtn: document.querySelector("#resetBtn"),
  focusButtons: document.querySelector("#focusButtons"),
  scan: document.querySelector("#scan"),
  bars: document.querySelector("#bars"),
  spoken: document.querySelector("#spoken"),
  signals: document.querySelector("#signals"),
  events: document.querySelector("#events"),
  matrix: document.querySelector("#matrix")
};

async function api(path, options = {}) {
  const res = await fetch(path, {
    headers: { "content-type": "application/json" },
    ...options
  });
  return res.json();
}

function bar(label, value, color) {
  const pct = Math.round((value || 0) * 100);
  return `<div class="bar"><div class="bar-head"><span>${label}</span><span>${pct}%</span></div><div class="track"><div class="fill" style="width:${pct}%;background:${color}"></div></div></div>`;
}

function render(data) {
  const focus = data.focus || "ether";
  els.focusPill.textContent = `Focus: ${focus}`;
  els.tickCount.textContent = `Tick ${data.tickCount || 0}`;

  const regions = data.regions || [];
  els.scan.innerHTML = regions.map((region) => `
    <article class="node ${region.active ? "active" : ""}" style="--accent:${region.color}">
      <div class="glyph">${region.glyph}</div>
      <strong>${region.label}</strong>
      <span>${Math.round((region.load || 0) * 100)}% load</span>
      <small>${region.role || "processor"}</small>
    </article>
  `).join("");

  els.bars.innerHTML = regions.map((region) => bar(`${region.glyph} ${region.label}`, region.load || region.activation || 0, region.color)).join("");
  els.signals.innerHTML = (data.signals || []).map((signal) => `<div class="signal"><b>${signal.glyph} ${signal.label}</b><span>${signal.channel}</span><p>${signal.text}</p></div>`).join("") || "<p>No signals yet.</p>";
  els.events.innerHTML = (data.events || []).map((event) => `<pre>${JSON.stringify(event, null, 2)}</pre>`).join("") || "<p>No events yet.</p>";
  els.matrix.innerHTML = matrix(data.links || {});

  if (data.spoken) {
    els.spoken.textContent = data.spoken.text || JSON.stringify(data.spoken, null, 2);
  }
}

function matrix(links) {
  const header = `<div></div>${loopIds.map((id) => `<b>${glyphs[id]} ${id}</b>`).join("")}`;
  const rows = loopIds.map((row) => `<b>${glyphs[row]} ${row}</b>${loopIds.map((col) => {
    const value = row === col ? "-" : Number(links?.[row]?.[col] || 0).toFixed(2);
    return `<span>${value}</span>`;
  }).join("")}`);
  return `<div class="matrix-grid">${header}${rows.join("")}</div>`;
}

async function runTick() {
  const input = els.prompt.value.trim();
  const data = await api("/api/tick", { method: "POST", body: JSON.stringify({ input }) });
  render(data);
}

async function reset() {
  const data = await api("/api/reset", { method: "POST", body: "{}" });
  render(await api("/api/scan"));
}

function makeFocusButtons() {
  els.focusButtons.innerHTML = loopIds.map((id) => `<button class="mini" data-loop="${id}">${glyphs[id]} ${id}</button>`).join("");
  els.focusButtons.addEventListener("click", async (event) => {
    const loop = event.target?.dataset?.loop;
    if (!loop) return;
    const data = await api("/api/focus", { method: "POST", body: JSON.stringify({ loop }) });
    render(data);
  });
}

els.sendBtn.addEventListener("click", runTick);
els.resetBtn.addEventListener("click", reset);
els.prompt.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) runTick();
});

makeFocusButtons();
render(await api("/api/scan"));
