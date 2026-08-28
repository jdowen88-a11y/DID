/**
 * ELEMENTAL TRAINER — simultaneous field edition
 * Every experience is available to every elemental loop.
 * Each loop learns through its own lens; no focus winner owns the event.
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const ELEMENTS = ["fire", "earth", "water", "air", "ether"];
const VOCAB = [
  "act", "action", "urgent", "move", "fast", "priority", "protect", "risk", "danger", "commit",
  "build", "repo", "verify", "files", "test", "structure", "ground", "proof", "memory", "stable", "implementation", "concrete",
  "feel", "trust", "repair", "connection", "emotion", "emotional", "continuity", "care", "relationship", "flow", "restore",
  "explain", "why", "map", "language", "theory", "strategy", "pattern", "compare", "routes", "abstract", "question", "reframe", "design", "idea",
  "integrate", "whole", "system", "meaning", "loop", "coherence", "synthesis", "meta", "horizon", "align", "signals", "combine", "answer"
];
const VOCAB_SIZE = VOCAB.length;
const HIDDEN_SIZE = 5;
const OUTPUT_SIZE = 5;
const LEARNING_RATES = { fire: 0.045, earth: 0.018, water: 0.032, air: 0.038, ether: 0.022 };
const MOMENTUM = { fire: 0.82, earth: 0.92, water: 0.86, air: 0.80, ether: 0.90 };
const EVOLUTION_DRIVE = { fire: 1.4, earth: 0.7, water: 1.1, air: 1.3, ether: 1.0 };

function round(v) { return Math.round(v * 100000) / 100000; }
function clamp(v, lo = -2, hi = 2) { return Math.max(lo, Math.min(hi, v)); }
function relu(v) { return Math.max(0, v); }
function reluGrad(v) { return v > 0 ? 1 : 0; }
function softmax(arr) { const max = Math.max(...arr); const exps = arr.map(v => Math.exp(v - max)); const sum = exps.reduce((a,b)=>a+b,0)||1; return exps.map(v=>v/sum); }
function tokenize(text) { return String(text || "").toLowerCase().replace(/[^a-z0-9\s-]/g, " ").split(/\s+/).filter(Boolean); }
function vectorize(text) { const words = tokenize(text); const counts = new Map(); for (const w of words) counts.set(w,(counts.get(w)||0)+1); return VOCAB.map(term=>Math.min(counts.get(term)||0,3)/3); }
function makeWeights(rows, cols, scale=0.1) { return Array.from({length:rows},()=>Array.from({length:cols},()=>(Math.random()*2-1)*scale)); }
function dot(a,b){ return a.reduce((s,v,i)=>s+v*b[i],0); }

class ElementLoopTrainer {
  constructor(element) {
    this.element=element; this.lr=LEARNING_RATES[element]; this.momentum=MOMENTUM[element]; this.drive=EVOLUTION_DRIVE[element];
    this.trainCount=0; this.totalLoss=0; this.recentLosses=[]; this.weightDrift=0; this.peakConfidence=0; this.evolutionEvents=[];
    this.W1=makeWeights(HIDDEN_SIZE,VOCAB_SIZE,0.12); this.b1=new Array(HIDDEN_SIZE).fill(0);
    this.W2=makeWeights(OUTPUT_SIZE,HIDDEN_SIZE,0.12); this.b2=new Array(OUTPUT_SIZE).fill(0);
    this.vW1=makeWeights(HIDDEN_SIZE,VOCAB_SIZE,0); this.vb1=new Array(HIDDEN_SIZE).fill(0);
    this.vW2=makeWeights(OUTPUT_SIZE,HIDDEN_SIZE,0); this.vb2=new Array(OUTPUT_SIZE).fill(0);
  }

  forward(input){ const x=vectorize(input); const h=this.W1.map((row,i)=>relu(dot(row,x)+this.b1[i])); const logits=this.W2.map((row,i)=>dot(row,h)+this.b2[i]); const probs=softmax(logits); return {x,h,logits,probs}; }

  train(input, targetElement=this.element, strength=1){
    const targetIndex=ELEMENTS.indexOf(targetElement); if(targetIndex===-1)return null;
    const {x,h,probs}=this.forward(input); const loss=-Math.log(Math.max(probs[targetIndex],1e-9));
    this.trainCount++; this.totalLoss+=loss; this.recentLosses.push(loss); if(this.recentLosses.length>50)this.recentLosses.shift();
    const dLogits=[...probs]; dLogits[targetIndex]-=1; const effectiveLr=this.lr*this.drive*Math.max(0.1,Number(strength)||1);
    for(let i=0;i<OUTPUT_SIZE;i++){ for(let j=0;j<HIDDEN_SIZE;j++){ const grad=dLogits[i]*h[j]; this.vW2[i][j]=this.momentum*this.vW2[i][j]-effectiveLr*grad; this.weightDrift+=Math.abs(this.vW2[i][j]); this.W2[i][j]=clamp(this.W2[i][j]+this.vW2[i][j]); } this.vb2[i]=this.momentum*this.vb2[i]-effectiveLr*dLogits[i]; this.b2[i]+=this.vb2[i]; }
    const dH=this.W2[0].map((_,j)=>dLogits.reduce((s,g,i)=>s+g*this.W2[i][j],0));
    for(let i=0;i<HIDDEN_SIZE;i++){ const dRelu=reluGrad(h[i])*dH[i]; for(let j=0;j<VOCAB_SIZE;j++){ const grad=dRelu*x[j]; this.vW1[i][j]=this.momentum*this.vW1[i][j]-effectiveLr*grad; this.weightDrift+=Math.abs(this.vW1[i][j]); this.W1[i][j]=clamp(this.W1[i][j]+this.vW1[i][j]); } this.vb1[i]=this.momentum*this.vb1[i]-effectiveLr*dRelu; this.b1[i]+=this.vb1[i]; }
    const confidence=probs[targetIndex]; if(confidence>this.peakConfidence){ this.peakConfidence=confidence; this.evolutionEvents.push({at:new Date().toISOString(),type:"peak_confidence",element:this.element,confidence:round(confidence),trainCount:this.trainCount}); if(this.evolutionEvents.length>20)this.evolutionEvents.shift(); }
    return {element:this.element,loss:round(loss),confidence:round(confidence),weightDrift:round(this.weightDrift),trainCount:this.trainCount};
  }

  predict(input){ const {probs}=this.forward(input); const distribution=Object.fromEntries(ELEMENTS.map((el,i)=>[el,round(probs[i])])); return {element:this.element,distribution,trainCount:this.trainCount}; }
  recentAvgLoss(){ return this.recentLosses.length?round(this.recentLosses.reduce((a,b)=>a+b,0)/this.recentLosses.length):null; }
  status(){ return {element:this.element,trainCount:this.trainCount,avgLoss:this.recentAvgLoss(),totalLoss:round(this.totalLoss),weightDrift:round(this.weightDrift),peakConfidence:round(this.peakConfidence),learningRate:this.lr,evolutionDrive:this.drive,momentum:this.momentum,recentEvolutionEvents:this.evolutionEvents.slice(-5)}; }
  serialize(){ return {element:this.element,trainCount:this.trainCount,totalLoss:this.totalLoss,weightDrift:this.weightDrift,peakConfidence:this.peakConfidence,evolutionEvents:this.evolutionEvents,W1:this.W1,b1:this.b1,W2:this.W2,b2:this.b2,vW1:this.vW1,vb1:this.vb1,vW2:this.vW2,vb2:this.vb2,recentLosses:this.recentLosses}; }
  hydrate(data){ if(!data||data.element!==this.element)return; for(const key of ["trainCount","totalLoss","weightDrift","peakConfidence"]) if(data[key]!==undefined)this[key]=data[key]; for(const key of ["evolutionEvents","W1","b1","W2","b2","vW1","vb1","vW2","vb2","recentLosses"]) if(data[key])this[key]=data[key]; }
}

export class ElementalTrainer {
  constructor(options={}) { this.filePath=options.filePath||process.env.ELEMENT_TRAINER_PATH||"data/elemental_trainer.local.json"; this.loops=Object.fromEntries(ELEMENTS.map(el=>[el,new ElementLoopTrainer(el)])); this.totalExperiences=0; this.evolutionLog=[]; this.load(); }

  absorb(experience){
    const input=String(experience?.input||"").trim(); if(!input)return null;
    const activations=experience?.activations||{};
    const results={};
    for(const el of ELEMENTS){ const strength=0.5+Number(activations[el]||0.5); results[el]=this.loops[el].train(input,el,strength); }
    this.totalExperiences++;
    this.evolutionLog.push({at:new Date().toISOString(),experience:this.totalExperiences,type:"whole_field_learning",elements:[...ELEMENTS]});
    if(this.evolutionLog.length>100)this.evolutionLog.shift(); this.save(); return results;
  }

  consensus(input){
    const views=Object.fromEntries(ELEMENTS.map(el=>[el,this.loops[el].predict(input)]));
    const distribution=Object.fromEntries(ELEMENTS.map(target=>[target,round(ELEMENTS.reduce((sum,lens)=>sum+(views[lens].distribution[target]||0),0)/ELEMENTS.length)]));
    return {distribution,views,totalExperiences:this.totalExperiences,note:"Distribution is descriptive. No element wins or gains authority."};
  }

  status(){ return {totalExperiences:this.totalExperiences,loops:Object.fromEntries(ELEMENTS.map(el=>[el,this.loops[el].status()])),recentEvolution:this.evolutionLog.slice(-10)}; }
  save(){ if(!this.filePath)return; try{ mkdirSync(path.dirname(this.filePath),{recursive:true}); writeFileSync(this.filePath,JSON.stringify({savedAt:new Date().toISOString(),totalExperiences:this.totalExperiences,evolutionLog:this.evolutionLog,loops:Object.fromEntries(ELEMENTS.map(el=>[el,this.loops[el].serialize()]))},null,2)); }catch{} }
  load(){ if(!this.filePath||!existsSync(this.filePath))return; try{ const raw=JSON.parse(readFileSync(this.filePath,"utf8")); this.totalExperiences=raw.totalExperiences||0; this.evolutionLog=raw.evolutionLog||[]; for(const el of ELEMENTS) if(raw.loops?.[el])this.loops[el].hydrate(raw.loops[el]); }catch{} }
  reset(){ this.loops=Object.fromEntries(ELEMENTS.map(el=>[el,new ElementLoopTrainer(el)])); this.totalExperiences=0; this.evolutionLog=[]; this.save(); }
}
