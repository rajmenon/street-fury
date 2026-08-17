# Contributing to Street Fury

This repo is also a live demo of reviewing **large AI-assisted changes** as a GitHub stacked PR.

## The rule

Do not open one giant pull request for a multi-layer feature.

If an agent can generate the whole feature in one pass, **you still slice it** before anyone reviews it.

## How to slice

A stack is a story from the bottom up. Each pull request is one concern:

1. **Model** — types, state, invariants. No UI, no fight-loop wiring.
2. **Behavior** — the new rules (AI, combat, scoring). Still no menu chrome.
3. **Presentation** — HUD / CSS / copy. Must not change combat rules.
4. **Wiring** — connect the layers to `main.js` and ship the player-facing path.

If code in layer N depends on layer M, M is below N. Never the other way around.

Keep each layer small enough that a reviewer can read the whole diff without scrolling past the plot.

## Agent workflow

```text
/design            →  PR Plan DAG (one node per layer)
/execute-plan      →  implement each node, review it, assemble the stack
gh stack submit    →  open the GitHub stack
/review --pr N     →  human-facing review on one layer
/review-stack      →  bottom-up review of every layer, then a cross-layer pass
/pr-babysit add N  →  keep CI green and restack after feedback
```

Plan the layers **before** generating code. Do not accept a 40-file agent dump and "sort it out in review."

## Review bar for AI-generated layers

Reviewers own intent, invariants, and architecture. CI owns style, tests, and the happy path.

On every layer, ask:

- Does this layer stay in its lane?
- Did the agent invent an API, package, or game rule that does not exist?
- Are tests asserting behavior, or just asserting that the agent’s code exists?
- Would a bug here silently break a layer above?

Approve the layer, not the whole feature. The stack merge is a separate decision.
