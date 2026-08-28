const loopIds = ["fire", "earth", "water", "air", "ether"];
const glyphs = { fire: "🔥", earth: "🌍", water: "💧", air: "🌬️", ether: "✨" };

function el(tag, className = "", text = "") { const node=document.createElement(tag); if(className)node.className=className; if(text)node.textContent=text; return node; }
function sectionTitle(title,note){ const wrap=el("div","section-title"); wrap.append(el("h2","",title),el("span","",note)); return wrap; }

function bootShell(){
  const root=document.querySelector("#app")||document.body; root.textContent="";
  const shell=el("main","shell");
  const hero=el("section","hero card"); const heroText=el("div");
  heroText.append(el("p","eyebrow","Five element simultaneous field"),el("h1","","Element Lab"),el("p","subcopy","Five present voices, shared links, whole-field learning. Amplification changes volume, never authority."));
  const fieldPill=el("div","status-pill","Field: all voices present"); fieldPill.id="fieldPill"; hero.append(heroText,fieldPill);

  const topGrid=el("section","grid two");
  const mapCard=el("div","card"); const tick=el("span","","Tick 0"); tick.id="tickCount"; const mapTitle=el("div","section-title"); mapTitle.append(el("h2","","Live Field"),tick); const scan=el("div","scan"); scan.id="scan"; mapCard.append(mapTitle,scan);
  const consoleCard=el("div","card"); consoleCard.append(sectionTitle("Chat Console","local field"));
  const prompt=document.createElement("textarea"); prompt.id="prompt"; prompt.placeholder="Type a message for all five elemental voices.";
  const buttonRow=el("div","button-row"); const sendBtn=el("button","","Chat"); sendBtn.id="sendBtn"; const resetBtn=el("button","ghost","Reset"); resetBtn.id="resetBtn"; buttonRow.append(sendBtn,resetBtn);
  const amplifyButtons=el("div","focus-buttons"); amplifyButtons.id="amplifyButtons"; consoleCard.append(prompt,buttonRow,el("p","eyebrow","Optional amplification — no muting"),amplifyButtons); topGrid.append(mapCard,consoleCard);

  const midGrid=el("section","grid two"); const barsCard=el("div","card"); barsCard.append(sectionTitle("Activations","descriptive, not authority")); const bars=el("div","bars"); bars.id="bars"; barsCard.append(bars);
  const outputCard=el("div","card"); outputCard.append(sectionTitle("Whole-field Output","all voices")); const spoken=el("pre","spoken","No chat yet."); spoken.id="spoken"; outputCard.append(spoken); midGrid.append(barsCard,outputCard);

  const lowGrid=el("section","grid two"); const signalsCard=el("div","card"); signalsCard.append(sectionTitle("Signals","simultaneous")); const signals=el("div","signals"); signals.id="signals"; signalsCard.append(signals); const eventsCard=el("div","card"); eventsCard.append(sectionTitle("Events","trace")); const events=el("div","events"); events.id="events"; eventsCard.append(events); lowGrid.append(signalsCard,eventsCard);
  const matrixCard=el("section","card"); matrixCard.append(sectionTitle("Links","resonance matrix")); const matrix=el("div","matrix"); matrix.id="matrix"; matrixCard.append(matrix);
  shell.append(hero,topGrid,midGrid,lowGrid,matrixCard); root.append(shell);
}

bootShell();
const els={fieldPill:document.querySelector("#fieldPill"),tickCount:document.querySelector("#tickCount"),prompt:document.querySelector("#prompt"),sendBtn:document.querySelector("#sendBtn"),resetBtn:document.querySelector("#resetBtn"),amplifyButtons:document.querySelector("#amplifyButtons"),scan:document.querySelector("#scan"),bars:document.querySelector("#bars"),spoken:document.querySelector("#spoken"),signals:document.querySelector("#signals"),events:document.querySelector("#events"),matrix:document.querySelector("#matrix")};
async function api(path,options={}){ const res=await fetch(path,{headers:{"content-type":"application/json"},...options}); return res.json(); }
function clear(node){node.textContent="";}

function render(data){
  els.fieldPill.textContent="Field: all voices present"; els.tickCount.textContent=`Tick ${data.tickCount||0}`;
  const regions=data.regions||[]; clear(els.scan); clear(els.bars);
  for(const region of regions){
    const card=el("article","node active"); card.style.setProperty("--accent",region.color||"#ffffff"); card.append(el("div","glyph",region.glyph||""),el("strong","",region.label||region.id),el("span","",`${Math.round((region.load||0)*100)}% signal`),el("small","",`${region.role||"voice"} · amp ${Number(region.amplification||1).toFixed(2)}x`)); els.scan.append(card);
    const bar=el("div","bar"); const head=el("div","bar-head"); head.append(el("span","",`${region.glyph} ${region.label}`),el("span","",`${Math.round((region.load||0)*100)}%`)); const track=el("div","track"); const fill=el("div","fill"); fill.style.width=`${Math.round((region.load||0)*100)}%`; fill.style.background=region.color||"#ffffff"; track.append(fill); bar.append(head,track); els.bars.append(bar);
  }
  clear(els.signals); for(const signal of data.signals||[]){ const box=el("div","signal"); box.append(el("b","",`${signal.glyph} ${signal.label}`),el("span","",signal.channel),el("p","",signal.text)); els.signals.append(box); }
  clear(els.events); for(const event of data.events||[])els.events.append(el("pre","",JSON.stringify(event,null,2)));
  renderMatrix(data.links||{});
  if(data.reply) els.spoken.textContent=`${data.reply.text}\n\nprovider: ${data.reply.provider}\nmodel: ${data.reply.model}`;
  else if(data.voices) els.spoken.textContent=data.voices.map(v=>v.text).join("\n\n");
}

function renderMatrix(links){ clear(els.matrix); const grid=el("div","matrix-grid"); grid.append(el("div")); for(const id of loopIds)grid.append(el("b","",`${glyphs[id]} ${id}`)); for(const row of loopIds){ grid.append(el("b","",`${glyphs[row]} ${row}`)); for(const col of loopIds){ const value=row===col?"-":Number(links?.[row]?.[col]||0).toFixed(2); grid.append(el("span","",value)); } } els.matrix.append(grid); }
async function runChat(){ const input=els.prompt.value.trim(); render(await api("/api/chat",{method:"POST",body:JSON.stringify({input})})); }
async function reset(){ await api("/api/reset",{method:"POST",body:"{}"}); render(await api("/api/scan")); }
function makeAmplifyButtons(){ for(const id of loopIds){ const button=el("button","mini",`${glyphs[id]} amplify ${id}`); button.addEventListener("click",async()=>render(await api("/api/focus",{method:"POST",body:JSON.stringify({loop:id,amount:1.25,reason:"dashboard amplification"})}))); els.amplifyButtons.append(button); } }
els.sendBtn.addEventListener("click",runChat); els.resetBtn.addEventListener("click",reset); els.prompt.addEventListener("keydown",event=>{if(event.key==="Enter"&&(event.metaKey||event.ctrlKey))runChat();}); makeAmplifyButtons(); render(await api("/api/scan"));
