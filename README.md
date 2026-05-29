# DID

**DID** in this repo means **Distributed Inner Dialogue**: a fictional multi-agent cognition sandbox with five elemental reasoning loops and an interactive brain-scan style dashboard.

> Important: this is **not** a clinical DID simulator, diagnostic tool, therapy tool, or reproduction of any copyrighted character. It uses a dramatic “spotlight” orchestration mechanic inspired by multi-agent fiction: several internal loops can produce background signals at the same time, but only one loop is allowed to speak externally at a time.

## Core concept

The agent is built around five connected cognition loops:

1. **Fire** - urgency, defense, action, risk response, propulsion.
2. **Earth** - structure, memory, boundaries, verification, stability.
3. **Water** - emotion, empathy, pattern-feel, repair, relational reading.
4. **Air** - abstraction, language, strategy, curiosity, lateral motion.
5. **Ether** - synthesis, meta-reasoning, integration, long-horizon coherence.

Each loop can:

- score incoming input,
- generate an internal background signal,
- compete for the spotlight,
- protect or amplify another loop,
- eject the current speaker when its activation crosses threshold,
- learn from session memory,
- become gradually aware of other loops through resonance events.

## What the dashboard shows

The dashboard includes:

- a central “brain scan” panel,
- live loop activation bars,
- spotlight holder,
- background signals from non-speaking loops,
- ejection and protection events,
- awareness links between loops,
- memory trace output,
- a test console for triggering loop conflict and cooperation.

## Run locally

```bash
npm install
npm start
```

Then open:

```text
http://localhost:3000
```

## Run tests

```bash
npm test
```

## API overview

```http
GET  /api/status
GET  /api/scan
POST /api/tick
POST /api/force
POST /api/reset
```

Example tick:

```bash
curl -X POST http://localhost:3000/api/tick \
  -H "Content-Type: application/json" \
  -d '{"input":"Something feels wrong. Protect the system but do not panic."}'
```

## Knowledge snapshot

The repo includes a `data/knowledge_snapshot.json` manifest dated **2026-05-29**. It does not contain the whole internet. That would be physically impossible to ship in a normal repo. Instead, it defines the intended knowledge horizon and the layered domains the agent is designed to reason across when connected to a real language-model provider or retrieval system.

## Safety boundaries

This project is fiction-oriented software architecture. It avoids:

- pretending to create a real mental disorder,
- encouraging identity fragmentation,
- impersonating copyrighted characters exactly,
- claiming to contain a complete copy of internet knowledge,
- replacing professional mental-health care.

The useful version is a controlled multi-agent reasoning lab: strange little cognition terrarium, glass walls, labeled buttons, no loose wires in the soup. 🧠⚡
