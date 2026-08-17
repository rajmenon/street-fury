---
name: review-stack
description: >
  Review a GitHub stacked pull request bottom-up, then the seams between
  layers. Use when the user says "review this stack", "review-stack",
  "/review-stack", or wants a stacked-PR review of a large AI-assisted change.
---

# Review a GitHub stack

You coordinate a stacked review. You do not invent findings yourself. For each layer you launch a reviewer subagent using the same persona and output format as `/review`. After every layer is reviewed, you write a short cross-layer report.

## Setup

1. Confirm `gh auth status` works.
2. Detect the stack. Prefer GitHub stacked PRs:

```bash
gh extension list
gh stack view --json
```

If `gh stack view` fails, walk open PRs: a stack is a chain where each PR's `baseRefName` is another PR's `headRefName`, ending at the default branch.

3. Order layers **bottom-up** (closest to `main` first). Record for each layer: number, title, url, base, head.

4. Report the stack to the user, then review in that order. Do not start at the top.

## Per-layer review

For each layer, follow the `/review --pr <number>` skill exactly:

- Collect `gh pr diff` and `gh pr view --json`.
- Launch one `[reviewer]` subagent against that layer only.
- Ask the reviewer to stay in-lane: flag code that belongs in a different layer.
- Post a PENDING GitHub review when there are findings. Do not set `event`.
- The user submits the review in the GitHub UI.

Extra prompt for stack layers (append to the reviewer prompt):

```
This pull request is one layer of a stack. Only review this layer's diff.
Flag layer pollution: UI in a model PR, combat rule changes in a HUD PR,
or fight-loop wiring in a module that should stay pure.
Do not review files that only appear in other layers.
```

## Cross-layer pass

After the last layer, write `docs/stack-review-summary.md` (or a scratch file if `docs/` is missing) with:

1. Stack map (bottom → top, PR numbers, one-line verdict each).
2. Seams: does a higher layer depend on something a lower layer does not actually provide?
3. Pollution: did any layer change the wrong concern?
4. AI-specific risks seen more than once (hallucinated APIs, tests that mirror implementation, extra scope).
5. Merge advice: safe to land from the bottom, or block on a specific layer.

Do not approve the feature as a whole. Approve or block **layers**.

## Rules

- Bottom-up only.
- One reviewer subagent per layer. Never one reviewer on the combined `main...top` diff.
- Never merge.
- Never force-push. `gh stack rebase` / `gh stack push` are for `/pr-babysit` after the author accepts feedback.
- If the repo is not a GitHub stack, say so and review the detected branch chain the same way.
