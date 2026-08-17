export function bindTrainingHud() {
  return {
    root: document.getElementById("train-panel"),
    policy: document.getElementById("train-policy"),
    blurb: document.getElementById("train-blurb"),
    combo: document.getElementById("train-combo"),
    best: document.getElementById("train-best"),
    hits: document.getElementById("train-hits"),
    last: document.getElementById("train-last"),
  };
}

export function setTrainingHudVisible(hud, visible) {
  if (!hud?.root) return;
  hud.root.classList.toggle("hidden", !visible);
}

export function renderTrainingHud(hud, session) {
  if (!hud?.root || !session) return;
  hud.policy.textContent = session.policy.toUpperCase();
  hud.blurb.textContent =
    session.policy === "stand"
      ? "Dummy stands still"
      : session.policy === "block"
        ? "Dummy holds block"
        : "Dummy punches after you swing";
  hud.combo.textContent = String(session.combo);
  hud.best.textContent = String(session.bestCombo);
  hud.hits.textContent = String(session.hits);
  hud.last.textContent = session.lastMove ? session.lastMove.toUpperCase() : "—";
}
