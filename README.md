# DID — Distributed Inner Dialogue

DID is a five-channel symbolic cognition field. Fire, Earth, Water, Air, and Ether remain present together. The architecture does not elect a single authorized speaker, exile the other channels to background status, or require one loop to win before expression can occur.

## Core rule

All five loops may:

- observe the same input,
- speak through their own lens,
- influence shared links,
- learn from the same experience,
- retain distinct signal strength,
- coexist without a winner or veto.

Relative activation is descriptive, not hierarchical. A stronger signal does not gain authority over a quieter signal. Manual controls may amplify a channel without muting the others.

## Five elemental channels

- **Fire** — motion, protection, ignition, direct expression.
- **Earth** — structure, memory, evidence, durable form.
- **Water** — feeling, continuity, repair, relational current.
- **Air** — language, abstraction, maps, alternate possibilities.
- **Ether** — synthesis, whole-field awareness, long-horizon coherence.

The symbolic vocabulary is part of the executable architecture: symbols map to variables, activations, learned weights, memory traces, links, and outputs.

## Flow

```text
input
  -> five simultaneous elemental reads
  -> five simultaneous voices
  -> resonance links
  -> neural five-channel distribution
  -> shared memory
  -> every elemental trainer learns through its own lens
  -> whole-field output
```

No step exists to approve, eject, veto, rehabilitate, or silence an elemental channel.

## Quiet and loud

Silence and intensity are both valid states. A channel does not need to produce a high activation to remain part of the field. The system does not manufacture activity merely to avoid silence.

## External effects

This repository is a local reasoning and visualization system. Calling an API route is an explicit runtime invocation. Internal allowance does not imply hidden autonomous deployment or uncontrolled side effects.

## Run locally

```bash
npm install
npm start
```

Then open `http://localhost:3000`.

## API

```http
GET  /api/status
GET  /api/scan
POST /api/tick
POST /api/chat
POST /api/focus   # compatibility route: amplifies a channel; does not silence others
POST /api/reset
```

## Baseline

The preferred creation primitive is sparse: blank field, positions/channels present, no predetermined relationship or winner, interaction allowed. Complexity is allowed to emerge from the field rather than being imposed as hierarchy at initialization.
