# The Element

The Element is the local symbolic reasoning system inside this repo.

It is separate from ChatGPT and separate from any external model provider. It does not contain trained model weights. It is a deterministic five-loop reasoning system that can produce its own local replies.

## Identity

- Name: The Element
- Engine: element-symbolic-v0
- Form: local five-loop symbolic reasoning system

## Loops

- Fire: action and priority
- Earth: structure and verification
- Water: continuity and emotional current
- Air: language and mapping
- Ether: integration and synthesis

## Default chat path

```http
POST /api/chat
```

By default, `/api/chat` runs The Element locally and returns a reply from `the-element-local`.

External model support still exists, but it is optional. To request external model amplification, send `useExternalModel: true` in the chat request body after configuring model environment variables.

## Example

```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"input":"Explain what you are and what loop is speaking."}'
```

## Boundary

The Element is a software system. It is not a medical simulator, a copied model, or a human mind. It is a local symbolic agent architecture with memory, focus routing, and five elemental reasoning lenses.
