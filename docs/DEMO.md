# 12-minute live demo

**Goal:** show that a large AI-assisted change is reviewable when it is a GitHub stack, and that Grok skills do the mechanical review work so humans keep the judgment.

**Repo:** this Street Fury tree. **Feature:** Training Mode.

## Setup (before the room)

```bash
cd C:\Users\rajiv\src\street-fury
gh extension install github/gh-stack
npm install
npm test
gh stack view
```

Keep two browser windows ready:

1. The **bottom** pull request of the stack (stack map visible).
2. `git diff main...train/wire` on GitHub compare — the same change as one giant PR.

Optional: `npm run dev` so you can play Training Mode at the end.

## Script

### 0:00 — The pain (90s)

Open the giant compare (`main...train/wire`). Scroll. Say this:

> This is what an agent produces when you say “add training mode.” One PR. Model, dummy AI, HUD, fight-loop, keys, README. Reviewers skim. Bugs hide in the middle. The PR sits.

Point at the file list. Do not review it.

### 1:30 — The same change as a stack (2 min)

Open the bottom PR. Point at the **stack map**. Click each layer. Show that each Files tab is one concern.

Say:

> Same commits. Four pull requests. Each one targets the branch below it. CI and required reviews still run against `main` for every layer. Reviewers can take different layers in parallel.

### 3:30 — Review the model (2 min)

Stay on `train/session`.

```text
/review --pr <session-pr>
```

Walk the pending comments. The question on this layer is only: *are the session invariants right?*

### 5:30 — Review the dummy (2 min)

Open `train/dummy`. This is the high-risk layer.

Call out the punish policy. The dummy swings while the player is still in startup/active, not recovery — a typical agent “looks right” combat bug. A reviewer finds it because the diff is 80 lines, not 500.

```text
/review --pr <dummy-pr>
```

### 7:30 — Cross-layer pass (90s)

```text
/review-stack
```

The skill reviews bottom-up, then asks: did HUD change combat? Did wiring leak training rules into the arcade path? Did a layer use something that only exists above it?

### 9:00 — Feedback without restack hell (90s)

Say:

> Comment on the dummy layer. The author fixes *that* branch, then `gh stack rebase` (or `/pr-babysit`) carries the fix upward. You do not re-review the HUD because someone touched combat.

### 10:30 — Play it (90s)

`npm run dev` → pick a fighter → **TRAIN**.

- `C` cycles dummy policy
- `R` resets the round
- Timer should stay out of the way (or show the leftover arcade timer if you want the “agent missed it” beat)

Close: merge is still bottom-up, one click at the top lands the feature.

## Talking points if you get questions

- **Graphite vs GitHub stacks.** Graphite still works. This demo is native GitHub stacked PRs (`gh stack`), public preview as of July 2026. Existing branch protections apply to every layer.
- **Why not just smaller commits in one PR?** GitHub’s review UI is PR-shaped. Stacks give each layer its own required review, checks, and conversation.
- **Does this replace human review?** No. It makes human review possible again. Skills take the first pass. Humans approve intent.
