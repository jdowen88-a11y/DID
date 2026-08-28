import { ElementalCore } from "./core.js";
import { ElementNeuralModel } from "./element_neural_model.js";
import { ElementMemory } from "./element_memory.js";
import { ElementalTrainer } from "./elemental_trainer.js";

const LOOP_PERSONAS = {
  fire:  { name:"Fire",  stance:"motion",      line:"I name the movement and protective force in the signal." },
  earth: { name:"Earth", stance:"form",        line:"I give the signal durable structure without reducing it." },
  water: { name:"Water", stance:"continuity",  line:"I read the current, feeling, and connection through it." },
  air:   { name:"Air",   stance:"possibility", line:"I open names, maps, metaphors, and alternate routes." },
  ether: { name:"Ether", stance:"integration", line:"I hold the whole field without collapsing its differences." }
};

const clean = (input) => String(input || "").trim();
const scoreMap = (scan) => Object.fromEntries((scan.regions || []).map((region) => [region.id, region.load || 0]));

export class TheElement {
  constructor() {
    this.core = new ElementalCore();
    this.neural = new ElementNeuralModel();
    this.memory = new ElementMemory();
    this.trainer = new ElementalTrainer();
    this.turns = [];
    this.identity = {
      name: "The Element",
      version: "1.0.0-field",
      form: "five simultaneous elemental loops with shared memory and whole-field learning",
      neuralModel: this.neural.name,
      createdFor: "DID repository"
    };
  }

  reset() { this.turns = []; this.memory.reset(); return this.core.reset(); }
  status() { return { ...this.identity, ...this.core.status(), turnCount:this.turns.length, neural:{name:this.neural.name,kind:this.neural.kind,labels:this.neural.labels,vocabSize:this.neural.vocab.length}, memory:this.memory.summary(), training:this.trainer.status() }; }
  scan() { const scan=this.core.scan(); return {...scan,element:this.identity,neural:{name:this.neural.name,kind:this.neural.kind,labels:this.neural.labels,vocabSize:this.neural.vocab.length},memory:this.memory.summary(),training:this.trainer.status()}; }
  setFocus(loop,reason){ return this.core.setFocus(loop,reason); }
  amplify(loop,amount,reason){ return this.core.amplify(loop,amount,reason); }

  think(input) {
    const scan = this.core.tick(input);
    const neural = this.neural.influence(input, scoreMap(scan));
    const recalled = this.memory.recall(input, 3);
    const trainerField = this.trainer.consensus(input);
    const reply = this.compose(input, scan, neural.reading, recalled, trainerField);

    const turn = { at:new Date().toISOString(), input:clean(input), activations:scoreMap(scan), neuralDistribution:neural.reading.distribution, trainerDistribution:trainerField.distribution, reply };
    this.turns.push(turn); if(this.turns.length>100)this.turns.shift();
    const memoryTrace = this.memory.add({ ...turn, focus:"field", neuralWinner:"field" });
    const trainingResult = this.trainer.absorb({ input:clean(input), activations:scoreMap(scan), neuralDistribution:neural.reading.distribution });

    return { ...scan, element:this.identity, neural:neural.reading, blendedScores:neural.mixed, recalled, memoryTrace, memory:this.memory.summary(), trainerField, trainingResult, training:this.trainer.status(), reply };
  }

  compose(input, scan, neuralRun, recalled=[], trainerField=null) {
    const voices=(scan.voices||[]).map((voice)=>{
      const persona=LOOP_PERSONAS[voice.loop];
      return `${voice.glyph} ${persona.name} — ${persona.line} ${voice.text.replace(/^.*?:\s*/,"")}`;
    });
    const distribution=Object.entries(neuralRun?.distribution||{}).map(([id,value])=>`${id}:${Math.round(value*100)}%`).join(" · ");
    const trained=Object.entries(trainerField?.distribution||{}).map(([id,value])=>`${id}:${Math.round(value*100)}%`).join(" · ");
    const memoryLine=recalled.length?`Memory resonance: ${recalled.length} related trace(s) remain available to the whole field.`:"Memory resonance: open field; no prior match required.";

    return {
      provider:"the-element-local",
      model:"element-field-v1+neural-distribution+whole-field-trainer",
      voices: scan.voices || [],
      text:[
        `Input: ${clean(input)}`,
        ...voices,
        distribution?`Neural field: ${distribution}`:null,
        trained?`Learned field: ${trained}`:null,
        memoryLine,
        "No voice wins. No voice is backgrounded. Difference remains available inside one shared field."
      ].filter(Boolean).join("\n\n")
    };
  }
}
