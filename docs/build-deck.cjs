const pptxgen = require("pptxgenjs");

const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE";
pres.author = "Street Fury / stacked review demo";
pres.title = "Reviewing large AI-assisted changes with GitHub stacked PRs";
pres.subject = "GitHub stacked pull requests + Grok review skills";

const C = {
  navy: "0A1628",
  bg: "F0F4F8",
  teal: "0D9488",
  tealLight: "5EEAD4",
  white: "FFFFFF",
  slate: "1E293B",
  slateMid: "475569",
  slateLight: "94A3B8",
  divider: "CBD5E1",
  rowAlt: "E2E8F0",
  amber: "F59E0B",
  blue: "3B82F6",
  purple: "A78BFA",
  red: "EF4444",
  green: "10B981",
};

const F = { serif: "Georgia", sans: "Calibri" };
const W = 13.3;
const H = 7.5;

function headerBar(slide) {
  slide.background = { color: C.bg };
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 0, y: 0, w: W, h: 1.05,
    fill: { color: C.navy }, line: { color: C.navy, width: 0 },
  });
}

function title(slide, text) {
  slide.addText(text, {
    x: 0.55, y: 0.22, w: 12.2, h: 0.62,
    fontSize: 28, bold: true, color: C.white,
    fontFace: F.serif, valign: "middle", margin: 0,
  });
}

function footer(slide, text) {
  slide.addText(text, {
    x: 0.55, y: 7.12, w: 12.2, h: 0.26,
    fontSize: 11, italic: true, color: C.slateMid, fontFace: F.sans, margin: 0,
  });
}

function card(slide, x, y, w, h, accent) {
  slide.addShape(pres.shapes.RECTANGLE, {
    x, y, w, h,
    fill: { color: C.white },
    line: { color: C.white, width: 0 },
    shadow: { type: "outer", color: "000000", blur: 8, offset: 2, angle: 135, opacity: 0.1 },
  });
  slide.addShape(pres.shapes.RECTANGLE, {
    x, y, w: 0.1, h,
    fill: { color: accent }, line: { color: accent, width: 0 },
  });
}

// ---------------------------------------------------------------------------
// 1 Title
// ---------------------------------------------------------------------------
{
  const s = pres.addSlide();
  s.background = { color: C.navy };
  s.addShape(pres.shapes.OVAL, {
    x: 9.2, y: -1.2, w: 6.2, h: 6.2,
    fill: { color: "0F2A3F", transparency: 20 },
    line: { color: C.navy, width: 0 },
  });
  s.addShape(pres.shapes.OVAL, {
    x: 10.4, y: 0.6, w: 4.2, h: 4.2,
    fill: { color: "143850", transparency: 18 },
    line: { color: C.navy, width: 0 },
  });
  s.addText("REVIEWING LARGE AI-ASSISTED CHANGES", {
    x: 0.7, y: 1.7, w: 11.5, h: 0.35,
    fontSize: 13, color: C.tealLight, fontFace: F.sans, charSpacing: 3, margin: 0,
  });
  s.addText("GitHub stacked PRs make\nthe review possible again", {
    x: 0.7, y: 2.15, w: 11.5, h: 1.9,
    fontSize: 38, bold: true, color: C.white, fontFace: F.serif, margin: 0,
  });
  s.addText("A live demo on Street Fury — Training Mode as four reviewable layers,\nnot one 395-line pull request.", {
    x: 0.7, y: 4.2, w: 10.5, h: 0.7,
    fontSize: 16, color: C.slateLight, fontFace: F.sans, margin: 0,
  });
  s.addShape(pres.shapes.RECTANGLE, {
    x: 0, y: 6.85, w: W, h: 0.65,
    fill: { color: C.teal }, line: { color: C.teal, width: 0 },
  });
  s.addText("Street Fury  ·  github.com/rajmenon/street-fury  ·  Stack #5", {
    x: 0.7, y: 6.95, w: 12, h: 0.42,
    fontSize: 14, color: C.white, fontFace: F.sans, valign: "middle", margin: 0,
  });
}

// ---------------------------------------------------------------------------
// 2 The bottleneck
// ---------------------------------------------------------------------------
{
  const s = pres.addSlide();
  headerBar(s);
  title(s, "Agents write faster than humans can review");

  const stats = [
    ["+18%", "larger PRs", "as AI adoption rises", C.amber],
    ["+24%", "incidents / PR", "verification did not keep up", C.red],
    ["+30%", "change-fail", "the review bar got skimmed", C.red],
  ];
  stats.forEach(([num, label, note, color], i) => {
    const x = 0.55 + i * 4.15;
    card(s, x, 1.35, 3.95, 2.55, color);
    s.addText(num, {
      x: x + 0.3, y: 1.55, w: 3.45, h: 0.85,
      fontSize: 44, bold: true, color, fontFace: F.serif, margin: 0,
    });
    s.addText(label, {
      x: x + 0.3, y: 2.45, w: 3.45, h: 0.45,
      fontSize: 20, bold: true, color: C.slate, fontFace: F.sans, margin: 0,
    });
    s.addText(note, {
      x: x + 0.3, y: 2.95, w: 3.45, h: 0.6,
      fontSize: 14, color: C.slateMid, fontFace: F.sans, margin: 0,
    });
  });

  s.addText("TED's CTO said it plainly: AI made developers dramatically more productive, and that created a new bottleneck. PRs grew large enough that reviewers were struggling. Stacked PRs are GitHub's answer — now in public preview.", {
    x: 0.55, y: 4.15, w: 12.2, h: 0.85,
    fontSize: 16, color: C.slate, fontFace: F.sans, margin: 0,
  });

  const pains = [
    ["Skim, not review", "A 400-line mixed PR is approved on vibe."],
    ["Stale + conflicts", "The PR sits while the next feature starts."],
    ["Wrong comments", "Reviewers nitpick the HUD and miss the combat bug."],
  ];
  pains.forEach(([h, b], i) => {
    const x = 0.55 + i * 4.15;
    s.addText(h, {
      x, y: 5.15, w: 3.95, h: 0.35,
      fontSize: 16, bold: true, color: C.navy, fontFace: F.sans, margin: 0,
    });
    s.addText(b, {
      x, y: 5.5, w: 3.95, h: 0.7,
      fontSize: 14, color: C.slateMid, fontFace: F.sans, margin: 0,
    });
  });
  footer(s, "Sources: Jellyfish PR-size study; Cortex State of AI 2026; GitHub stacked PRs public preview, July 2026.");
}

// ---------------------------------------------------------------------------
// 3 Same change, two shapes
// ---------------------------------------------------------------------------
{
  const s = pres.addSlide();
  headerBar(s);
  title(s, "Same Street Fury feature. Two review shapes.");

  card(s, 0.55, 1.35, 5.85, 5.4, C.red);
  s.addText("ONE GIANT PR", {
    x: 0.85, y: 1.55, w: 5.3, h: 0.3,
    fontSize: 12, color: C.red, fontFace: F.sans, charSpacing: 1.5, margin: 0,
  });
  s.addText("main...train/wire", {
    x: 0.85, y: 1.9, w: 5.3, h: 0.4,
    fontSize: 22, bold: true, color: C.slate, fontFace: F.serif, margin: 0,
  });
  const giant = [
    ["Files", "10"],
    ["Lines", "+380 / −15"],
    ["Concerns mixed", "model, AI, HUD, wiring"],
    ["Review question", "“Does training mode work?”"],
    ["What happens", "Skim. Rubber stamp. Or stall."],
  ];
  giant.forEach(([k, v], i) => {
    const y = 2.5 + i * 0.72;
    s.addText(k, { x: 0.85, y, w: 2.2, h: 0.55, fontSize: 13, color: C.slateMid, fontFace: F.sans, valign: "middle", margin: 0 });
    s.addText(v, { x: 3.05, y, w: 3.05, h: 0.55, fontSize: 15, bold: true, color: C.slate, fontFace: F.sans, valign: "middle", margin: 0 });
  });

  card(s, 6.7, 1.35, 6.05, 5.4, C.teal);
  s.addText("GITHUB STACK #5", {
    x: 7.0, y: 1.55, w: 5.5, h: 0.3,
    fontSize: 12, color: C.teal, fontFace: F.sans, charSpacing: 1.5, margin: 0,
  });
  s.addText("Four pull requests", {
    x: 7.0, y: 1.9, w: 5.5, h: 0.4,
    fontSize: 22, bold: true, color: C.slate, fontFace: F.serif, margin: 0,
  });
  const layers = [
    ["#1 session", "113 lines", "invariants + tests"],
    ["#2 dummy", "75 lines", "combat brain only"],
    ["#3 HUD", "110 lines", "overlay + CSS"],
    ["#4 wire", "82 lines", "keys + fight loop"],
  ];
  layers.forEach(([pr, loc, note], i) => {
    const y = 2.5 + i * 0.9;
    s.addText(pr, { x: 7.0, y, w: 1.9, h: 0.7, fontSize: 16, bold: true, color: C.navy, fontFace: F.sans, valign: "middle", margin: 0 });
    s.addText(loc, { x: 8.95, y, w: 1.6, h: 0.7, fontSize: 16, color: C.teal, fontFace: F.sans, valign: "middle", margin: 0 });
    s.addText(note, { x: 10.55, y, w: 1.95, h: 0.7, fontSize: 14, color: C.slateMid, fontFace: F.sans, valign: "middle", margin: 0 });
  });
  footer(s, "Live: github.com/rajmenon/street-fury/compare/main...train/wire  vs  pulls/1 through /4");
}

// ---------------------------------------------------------------------------
// 4 How stacks work
// ---------------------------------------------------------------------------
{
  const s = pres.addSlide();
  headerBar(s);
  title(s, "A stack is a chain. Each PR shows only its layer.");

  const boxes = [
    { y: 1.4, label: "PR #4  train/wire", sub: "base: train/hud", c: C.purple },
    { y: 2.55, label: "PR #3  train/hud", sub: "base: train/dummy", c: C.blue },
    { y: 3.7, label: "PR #2  train/dummy", sub: "base: train/session", c: C.amber },
    { y: 4.85, label: "PR #1  train/session", sub: "base: main", c: C.teal },
  ];
  boxes.forEach((b) => {
    s.addShape(pres.shapes.RECTANGLE, {
      x: 0.55, y: b.y, w: 6.4, h: 1.0,
      fill: { color: C.white },
      line: { color: C.white, width: 0 },
      shadow: { type: "outer", color: "000000", blur: 7, offset: 2, angle: 135, opacity: 0.1 },
    });
    s.addShape(pres.shapes.RECTANGLE, {
      x: 0.55, y: b.y, w: 0.14, h: 1.0,
      fill: { color: b.c }, line: { color: b.c, width: 0 },
    });
    s.addText(b.label, {
      x: 0.9, y: b.y + 0.12, w: 5.8, h: 0.42,
      fontSize: 18, bold: true, color: C.slate, fontFace: F.sans, margin: 0,
    });
    s.addText(b.sub, {
      x: 0.9, y: b.y + 0.52, w: 5.8, h: 0.32,
      fontSize: 13, color: C.slateMid, fontFace: F.sans, margin: 0,
    });
  });

  const rights = [
    ["Stack map", "On every PR. Click any layer. See where you are."],
    ["Independent review", "Approve the model. Request changes on dummy. Leave HUD alone."],
    ["CI on every layer", "Checks and CODEOWNERS run against main, not just the bottom PR."],
    ["Merge your way", "Land the top to ship all four. Or merge #1 and the rest retarget."],
    ["Auto rebase", "Fix mid-stack. GitHub / gh stack rebase carries the fix up."],
  ];
  rights.forEach(([h, b], i) => {
    const y = 1.4 + i * 1.0;
    s.addText(h, {
      x: 7.25, y, w: 5.5, h: 0.35,
      fontSize: 16, bold: true, color: C.navy, fontFace: F.sans, margin: 0,
    });
    s.addText(b, {
      x: 7.25, y: y + 0.34, w: 5.5, h: 0.5,
      fontSize: 14, color: C.slateMid, fontFace: F.sans, margin: 0,
    });
  });
  footer(s, "gh stack init → add → submit. Preview on github.com, CLI, mobile, REST/GraphQL. No fork stacks.");
}

// ---------------------------------------------------------------------------
// 5 How to cut a stack
// ---------------------------------------------------------------------------
{
  const s = pres.addSlide();
  headerBar(s);
  title(s, "Cut the stack before the agent types");

  const steps = [
    ["1", "Model", "Types, state, invariants. Tests. No UI.", C.teal],
    ["2", "Behavior", "The new rule. Dummy AI. Scoring. Auth.", C.amber],
    ["3", "Presentation", "HUD, CSS, copy. Must not change rules.", C.blue],
    ["4", "Wiring", "main.js, keys, the player-facing path.", C.purple],
  ];
  steps.forEach(([n, h, b, c], i) => {
    const x = 0.55 + i * 3.15;
    card(s, x, 1.4, 3.0, 3.35, c);
    s.addText(n, {
      x: x + 0.25, y: 1.6, w: 2.5, h: 0.7,
      fontSize: 36, bold: true, color: c, fontFace: F.serif, margin: 0,
    });
    s.addText(h, {
      x: x + 0.25, y: 2.4, w: 2.5, h: 0.45,
      fontSize: 20, bold: true, color: C.slate, fontFace: F.sans, margin: 0,
    });
    s.addText(b, {
      x: x + 0.25, y: 2.95, w: 2.5, h: 1.4,
      fontSize: 15, color: C.slateMid, fontFace: F.sans, margin: 0,
    });
  });
  s.addText("Rule: if layer N needs code from layer M, M is below N. If a layer needs a paragraph to explain, split it. Humans own the cuts. Agents own the typing.", {
    x: 0.55, y: 5.05, w: 12.2, h: 0.85,
    fontSize: 16, color: C.slate, fontFace: F.sans, margin: 0,
  });
  footer(s, "GitHub: “Design a stack before you generate code.” Same rule as /design → PR Plan DAG.");
}

// ---------------------------------------------------------------------------
// 6 Skills close the loop
// ---------------------------------------------------------------------------
{
  const s = pres.addSlide();
  headerBar(s);
  title(s, "Skills turn the stack into a review system");

  const rows = [
    [" /design", "PR Plan DAG. One node per layer. Dependency order."],
    [" /execute-plan", "Implement in worktrees. Review each node. Assemble the stack."],
    [" /review --pr N", "First-pass review on one layer. Pending GitHub comments."],
    [" /review-stack", "Bottom-up on every layer, then the seams between them."],
    [" /pr-babysit", "CI, restack, comment replies. Human still merges."],
    [" gh stack", "init · add · submit · rebase · merge. Native GitHub."],
  ];
  rows.forEach(([cmd, desc], i) => {
    const y = 1.3 + i * 0.88;
    s.addShape(pres.shapes.RECTANGLE, {
      x: 0.55, y, w: 12.2, h: 0.78,
      fill: { color: i % 2 === 0 ? C.white : "E8EEF3" },
      line: { color: i % 2 === 0 ? C.white : "E8EEF3", width: 0 },
    });
    s.addText(cmd, {
      x: 0.75, y, w: 3.4, h: 0.78,
      fontSize: 16, bold: true, color: C.navy, fontFace: "Consolas", valign: "middle", margin: 0,
    });
    s.addText(desc, {
      x: 4.3, y, w: 8.2, h: 0.78,
      fontSize: 16, color: C.slate, fontFace: F.sans, valign: "middle", margin: 0,
    });
  });
}

// ---------------------------------------------------------------------------
// 7 What the dummy layer is for
// ---------------------------------------------------------------------------
{
  const s = pres.addSlide();
  headerBar(s);
  title(s, "This is why the layer has to be small");

  s.addText("PR #2 is 75 lines. A reviewer can actually see this.", {
    x: 0.55, y: 1.25, w: 12.2, h: 0.4,
    fontSize: 16, italic: true, color: C.slateMid, fontFace: F.sans, margin: 0,
  });

  card(s, 0.55, 1.8, 6.05, 4.85, C.red);
  s.addText("WHAT THE AGENT WROTE", {
    x: 0.85, y: 2.0, w: 5.5, h: 0.3,
    fontSize: 12, color: C.red, fontFace: F.sans, charSpacing: 1.2, margin: 0,
  });
  s.addText("Punish swings as soon as the player enters punch / kick / roundhouse.", {
    x: 0.85, y: 2.4, w: 5.5, h: 0.85,
    fontSize: 16, color: C.slate, fontFace: F.sans, margin: 0,
  });
  s.addText("That is startup and active — the dummy walks into the hit. The helper inRecovery() is already in the file and unused.", {
    x: 0.85, y: 3.3, w: 5.5, h: 1.2,
    fontSize: 16, color: C.slate, fontFace: F.sans, margin: 0,
  });
  s.addText("Classic agent bug: looks like fighting-game AI. Wrong about when.", {
    x: 0.85, y: 4.7, w: 5.5, h: 1.4,
    fontSize: 16, italic: true, color: C.slateMid, fontFace: F.sans, margin: 0,
  });

  card(s, 6.85, 1.8, 5.9, 4.85, C.teal);
  s.addText("WHAT THE REVIEWER ASKS", {
    x: 7.15, y: 2.0, w: 5.4, h: 0.3,
    fontSize: 12, color: C.teal, fontFace: F.sans, charSpacing: 1.2, margin: 0,
  });
  const qs = [
    "Is this the recovery window?",
    "Why is inRecovery unused?",
    "Does block hold down, or back?",
    "Would I find this in a 380-line PR?",
  ];
  qs.forEach((q, i) => {
    s.addText((i + 1).toString().padStart(2, "0"), {
      x: 7.15, y: 2.5 + i * 0.85, w: 0.55, h: 0.7,
      fontSize: 18, bold: true, color: C.teal, fontFace: F.serif, valign: "middle", margin: 0,
    });
    s.addText(q, {
      x: 7.75, y: 2.5 + i * 0.85, w: 4.7, h: 0.7,
      fontSize: 16, color: C.slate, fontFace: F.sans, valign: "middle", margin: 0,
    });
  });
  footer(s, "Planted, on purpose, in train/dummy. Run /review --pr 2 in the live demo.");
}

// ---------------------------------------------------------------------------
// 8 What stacking does not fix
// ---------------------------------------------------------------------------
{
  const s = pres.addSlide();
  headerBar(s);
  title(s, "Stacks fix the shape. They do not fix these.");

  const no = [
    ["A bad design, sliced", "Four bad layers are still a bad feature."],
    ["No tests", "A small untested combat PR is still a landmine."],
    ["Rubber-stamp culture", "Approve-the-layer is still a human job."],
    ["Agent extra scope", "If it rewrites arena.js, reject the layer."],
    ["No owner", "Someone still decides what Training Mode is."],
    ["Mechanical nits as review", "CI should have caught the semicolon."],
  ];
  no.forEach(([h, b], i) => {
    const col = i % 3;
    const row = Math.floor(i / 3);
    const x = 0.55 + col * 4.15;
    const y = 1.4 + row * 2.5;
    card(s, x, y, 3.95, 2.25, C.amber);
    s.addText(h, {
      x: x + 0.3, y: y + 0.3, w: 3.45, h: 0.7,
      fontSize: 18, bold: true, color: C.slate, fontFace: F.sans, margin: 0,
    });
    s.addText(b, {
      x: x + 0.3, y: y + 1.05, w: 3.45, h: 0.85,
      fontSize: 15, color: C.slateMid, fontFace: F.sans, margin: 0,
    });
  });
}

// ---------------------------------------------------------------------------
// 9 The rest of the system
// ---------------------------------------------------------------------------
{
  const s = pres.addSlide();
  headerBar(s);
  title(s, "What else has to be true");

  const items = [
    ["Plan first", "/design before generate. Do not structure a 40-file dump in review."],
    ["Split the work", "Agents do mechanical review. Humans approve intent and invariants."],
    ["Risk-route", "HUD CSS ≠ dummy combat. Senior eyes on the high-risk layer only."],
    ["Hunt AI tells", "Hallucinated APIs. Tests that mirror code. Deleted tests. Extra files."],
    ["Keep the stack healthy", "Fix on the owning branch. Rebase up. Never pile a model fix on wiring."],
    ["Measure the real bottleneck", "Lines per PR. Time to first review. Mechanical vs judgment comments."],
  ];
  items.forEach(([h, b], i) => {
    const y = 1.28 + i * 0.9;
    s.addShape(pres.shapes.OVAL, {
      x: 0.55, y: y + 0.12, w: 0.42, h: 0.42,
      fill: { color: C.teal }, line: { color: C.teal, width: 0 },
    });
    s.addText(String(i + 1), {
      x: 0.55, y: y + 0.12, w: 0.42, h: 0.42,
      fontSize: 14, bold: true, color: C.white, fontFace: F.sans, align: "center", valign: "middle", margin: 0,
    });
    s.addText(h, {
      x: 1.15, y, w: 3.3, h: 0.75,
      fontSize: 16, bold: true, color: C.navy, fontFace: F.sans, valign: "middle", margin: 0,
    });
    s.addText(b, {
      x: 4.5, y, w: 8.25, h: 0.75,
      fontSize: 16, color: C.slate, fontFace: F.sans, valign: "middle", margin: 0,
    });
  });
}

// ---------------------------------------------------------------------------
// 10 12-minute demo
// ---------------------------------------------------------------------------
{
  const s = pres.addSlide();
  headerBar(s);
  title(s, "Twelve minutes in the room");

  const beats = [
    ["0:00", "Open the giant compare. Scroll. Do not review it."],
    ["1:30", "Same commits as stack #5. Click the stack map."],
    ["3:30", "/review --pr 1  —  are the session invariants right?"],
    ["5:30", "/review --pr 2  —  find the punish-window bug."],
    ["7:30", "/review-stack  —  seams, pollution, merge advice."],
    ["9:00", "Comment on #2. Fix there. Rebase up. HUD is untouched."],
    ["10:30", "Play TRAIN. C cycles dummy. R resets."],
  ];
  beats.forEach(([t, d], i) => {
    const y = 1.25 + i * 0.75;
    s.addText(t, {
      x: 0.55, y, w: 1.6, h: 0.65,
      fontSize: 18, bold: true, color: C.teal, fontFace: "Consolas", valign: "middle", margin: 0,
    });
    s.addText(d, {
      x: 2.3, y, w: 10.4, h: 0.65,
      fontSize: 18, color: C.slate, fontFace: F.sans, valign: "middle", margin: 0,
    });
  });
}

// ---------------------------------------------------------------------------
// 11 Close
// ---------------------------------------------------------------------------
{
  const s = pres.addSlide();
  s.background = { color: C.navy };
  s.addShape(pres.shapes.OVAL, {
    x: 11.2, y: 5.2, w: 3.6, h: 3.6,
    fill: { color: "0F2A3F", transparency: 25 },
    line: { color: C.navy, width: 0 },
  });
  s.addText("THE ASK", {
    x: 0.7, y: 1.4, w: 12, h: 0.35,
    fontSize: 13, color: C.tealLight, fontFace: F.sans, charSpacing: 3, margin: 0,
  });
  s.addText("Ship features as stacks.\nReview layers, not dumps.", {
    x: 0.7, y: 1.9, w: 12, h: 1.7,
    fontSize: 36, bold: true, color: C.white, fontFace: F.serif, margin: 0,
  });
  const asks = [
    "Pilot: next AI-authored feature must be a gh stack.",
    "Install gh stack. Add /review-stack to the team skills.",
    "Required reviews stay on. Humans still submit the review.",
  ];
  asks.forEach((t, i) => {
    s.addText(`${i + 1}.  ${t}`, {
      x: 0.7, y: 3.9 + i * 0.55, w: 11.5, h: 0.5,
      fontSize: 18, color: C.tealLight, fontFace: F.sans, margin: 0,
    });
  });
  s.addShape(pres.shapes.RECTANGLE, {
    x: 0, y: 6.85, w: W, h: 0.65,
    fill: { color: C.teal }, line: { color: C.teal, width: 0 },
  });
  s.addText("github.com/rajmenon/street-fury   ·   docs/DEMO.md   ·   docs/review-playbook.md", {
    x: 0.7, y: 6.95, w: 12, h: 0.42,
    fontSize: 14, color: C.white, fontFace: F.sans, valign: "middle", margin: 0,
  });
}

pres.writeFile({ fileName: "C:/Users/rajiv/src/street-fury/docs/stacked-review.pptx" })
  .then(() => console.log("wrote docs/stacked-review.pptx"))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
