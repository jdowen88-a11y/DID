# Element AI Blueprint

This document defines the parts of Element AI that do not exist yet and turns them into a build plan.

## Name

Element AI is the larger system. The Element is the local agent instance inside the DID repo.

## Purpose

Element AI is a user-owned elemental reasoning system. It is designed to grow from a tiny local neural model into a modular agent stack with memory, training, evaluation, dashboard visibility, and optional model amplification.

## Core layers

1. Elemental Core
   - Five loops: fire, earth, water, air, ether.
   - Scores incoming input.
   - Controls focus and handoff.
   - Tracks resonance links.

2. Element Neural Model
   - Local model stored in repo.
   - Predicts the active elemental class.
   - Produces hidden activations, logits, probabilities, and ranked output.
   - Blends neural prediction with symbolic loop scores.

3. Element Memory
   - Stores turns.
   - Scores importance.
   - Recalls recent and relevant traces.
   - Preserves focus path and neural path.

4. Element Trainer
   - Reads training samples.
   - Builds vocabulary.
   - Trains small local weights.
   - Exports generated neural weights.

5. Element Evaluator
   - Runs sample prompts.
   - Checks expected elemental prediction.
   - Reports accuracy and confusion matrix.

6. Element Dashboard
   - Shows focus loop.
   - Shows neural winner.
   - Shows activation bars.
   - Shows memory and event trace.
   - Shows symbolic vs neural disagreement.

## Growth path

### v0.2

- Embedded tiny neural classifier.
- Local symbolic reply composer.
- Local memory in runtime.

### v0.3

- Persistent JSON memory file.
- Train script that generates new weights from data.
- Evaluation script.

### v0.4

- Small transformer-style token model.
- Conversation dataset builder.
- Dashboard view for hidden activations.

### v1.0

- Fully user-owned Element AI runtime.
- Trainable local model.
- Memory persistence.
- Evaluation dashboard.
- Optional external model only as amplifier, not core identity.

## Boundary

Element AI is not a clone of another model. It is an original architecture built from local components and user-owned design choices.
