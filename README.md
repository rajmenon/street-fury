# STREET FURY

A single-player 3D street fighting game. Pick **Dragon** (Bruce Lee–inspired Jeet Kune Do) or **Iron** (Mike Tyson–inspired heavyweight) and brawl on a night city street.

## Play

```bash
cd C:\Users\rajiv\src\street-fury
npm install
npm run dev
```

Then open the URL Vite prints (usually `http://localhost:5173`).

## Controls

| Key | Action |
|---|---|
| ← → | Walk / menu |
| ↑ | Jump |
| ↓ or hold **back** (away from foe) | Block |
| **<** or **,** | Punch |
| **>** or **.** | Kick |
| **/** | Roundhouse kick |
| Enter | Confirm / rematch |
| Esc | Back / change fighter |

Movement is **arrow keys only** — no WASD. After you pick a fighter you pick **Easy / Medium / Hard**. Rematch keeps the same difficulty.

- **Easy** — CPU is slower, delayed, and deals less damage.
- **Medium** — even fight.
- **Hard** — CPU blocks, punishes kicks, follows up, and throws roundhouses.

## Fighters

- **Dragon** — lean, red bandana, six-pack, fast high kicks, lower health.
- **Iron** — thick boxer, black bandana, six-pack, heavier punches, more health.

The CPU always plays the other fighter. Multiplayer is left for a later pass.

## Audio

Kick and hit sounds fire on connect. There is also punch, block, jump, and KO. A low street drone starts with the round.

Regenerate the WAV files:

```bash
npm run sfx
```

## Photo references

Character likenesses were derived from public-domain / Wikimedia Commons publicity photos:

- Bruce Lee, *Enter the Dragon* (1973) and a 1973 publicity portrait
- Mike Tyson early publicity portrait (pre-1985)

## Stack

Vite + Three.js. No backend. Multiplayer is not wired up yet.

## Reviewing large AI-assisted changes

This repo is the live demo for **GitHub stacked pull requests** plus Grok review skills.

The product change under review is **Training Mode**: a dummy partner, combo recorder, training HUD, and fight-loop wiring. That is the kind of feature an agent will dump as one 400–600 line PR. Here it is a stack of four pull requests instead.

| Layer | Branch | What a reviewer sees |
| --- | --- | --- |
| 1 | `train/session` | Session model, policies, combo recorder, tests. No UI. |
| 2 | `train/dummy` | Dummy stand / block / punish brain. No HUD. |
| 3 | `train/hud` | Overlay markup and CSS. No combat changes. |
| 4 | `train/wire` | Difficulty → TRAIN path, keys, fight-loop hookup. |

Review **bottom-up**. Open any pull request to see only that layer’s diff. The stack map at the top of each PR shows where you are.

```bash
gh extension install github/gh-stack
gh stack checkout <bottom-pr-number>
gh stack view
```

Agent commands used in the demo:

```text
/review --pr <n>     review one layer, post a pending GitHub review
/review-stack        review every layer bottom-up, then the seams
/pr-babysit add <n>  watch the stack, restack after comments
```

See [CONTRIBUTING.md](CONTRIBUTING.md), [docs/DEMO.md](docs/DEMO.md), and [docs/review-playbook.md](docs/review-playbook.md).
