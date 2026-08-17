import * as THREE from "three";
import { ROSTER, OTHER } from "./roster.js";
import { DIFFICULTIES, DIFFICULTY_ORDER, tuneSpec } from "./difficulty.js";
import { bindInput, consume, endFrame, playerInput } from "./input.js";
import { loadAudio, unlockAudio, play, startMusic, stopMusic } from "./audio.js";
import { loadGameTextures } from "./textures.js";
import { createArena } from "./arena.js";
import { Fighter, overlapping, STAGE_MIN, STAGE_MAX } from "./fighter.js";
import { think, resetAi } from "./ai.js";

const $ = (id) => document.getElementById(id);

const screens = {
  title: $("screen-title"),
  select: $("screen-select"),
  difficulty: $("screen-difficulty"),
  fight: $("screen-fight"),
  result: $("screen-result"),
};

const hud = {
  p1Name: $("p1-name"),
  p2Name: $("p2-name"),
  p1Hp: $("p1-hp"),
  p2Hp: $("p2-hp"),
  timer: $("timer"),
  banner: $("banner"),
  combo: $("combo"),
  resultTitle: $("result-title"),
  resultSub: $("result-sub"),
};

const canvas = $("stage");
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(42, window.innerWidth / window.innerHeight, 0.1, 80);
camera.position.set(0, 2.1, -7.4);

const clock = new THREE.Clock();
let textures = null;
let mode = "title";
let selected = "dragon";
let difficultyId = "medium";
let p1 = null;
let p2 = null;
let fightTime = 99;
let bannerT = 0;
let shake = 0;
let hitStop = 0;
let combo = 0;
let comboT = 0;
let sparks = [];
let roundLocked = false;

function show(name) {
  mode = name;
  for (const [key, el] of Object.entries(screens)) {
    el.classList.toggle("hidden", key !== name);
  }
}

function showBanner(text, seconds = 1.1) {
  hud.banner.textContent = text;
  hud.banner.classList.remove("hidden");
  bannerT = seconds;
}

function spawnSparks(x, y, color) {
  for (let i = 0; i < 10; i += 1) {
    const mesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.04, 6, 6),
      new THREE.MeshBasicMaterial({ color }),
    );
    mesh.position.set(x, y, 0.2);
    mesh.userData.v = new THREE.Vector3((Math.random() - 0.5) * 6, 2 + Math.random() * 4, (Math.random() - 0.5) * 2);
    mesh.userData.life = 0.35 + Math.random() * 0.2;
    scene.add(mesh);
    sparks.push(mesh);
  }
}

function updateSparks(dt) {
  for (let i = sparks.length - 1; i >= 0; i -= 1) {
    const s = sparks[i];
    s.userData.life -= dt;
    s.userData.v.y -= 18 * dt;
    s.position.addScaledVector(s.userData.v, dt);
    s.scale.multiplyScalar(0.92);
    if (s.userData.life <= 0) {
      scene.remove(s);
      s.geometry.dispose();
      s.material.dispose();
      sparks.splice(i, 1);
    }
  }
}

function clearFighters() {
  for (const fighter of [p1, p2]) {
    if (fighter) scene.remove(fighter.root);
  }
  p1 = null;
  p2 = null;
}

function currentDifficulty() {
  return DIFFICULTIES[difficultyId];
}

function paintDifficulty() {
  document.querySelectorAll(".diff-card").forEach((card) => {
    card.classList.toggle("selected", card.dataset.id === difficultyId);
  });
}

function startFight(playerId) {
  clearFighters();
  resetAi();
  const diff = currentDifficulty();
  const cpuId = OTHER[playerId];
  p1 = new Fighter(tuneSpec(ROSTER[playerId], diff, false), "p1", textures);
  p2 = new Fighter(tuneSpec(ROSTER[cpuId], diff, true), "p2", textures);
  scene.add(p1.root, p2.root);
  p1.syncTransform();
  p2.syncTransform();
  fightTime = 99;
  combo = 0;
  comboT = 0;
  roundLocked = false;
  hud.p1Name.textContent = p1.spec.name;
  hud.p2Name.textContent = p2.spec.name;
  hud.combo.classList.add("hidden");
  $("p2-tag").textContent = `CPU · ${diff.name}`;
  show("fight");
  showBanner("FIGHT!", 1.15);
  play("go", { volume: 0.9 });
  startMusic();
}

function finishRound(title, sub) {
  if (roundLocked) return;
  roundLocked = true;
  hud.resultTitle.textContent = title;
  hud.resultSub.textContent = sub;
  stopMusic();
  window.setTimeout(() => show("result"), 900);
}

function resolveHits() {
  const pairs = [
    [p1, p2],
    [p2, p1],
  ];
  for (const [atk, def] of pairs) {
    const box = atk.attackBox();
    if (!box || atk.didHit) continue;
    if (!overlapping(box, def.hurtBox())) continue;
    atk.didHit = true;
    const facingAtk = (atk.x - def.x) * def.facing > 0;
    const blocked = def.blocking && facingAtk;
    const result = def.takeHit(box, blocked);
    shake = blocked ? 0.08 : box.kind === "roundhouse" ? 0.28 : 0.16;
    hitStop = blocked ? 0.035 : box.kind === "roundhouse" ? 0.09 : 0.075;
    spawnSparks(box.x, box.y, blocked ? 0xf0c14b : 0xff5533);
    if (blocked) {
      play("block", { volume: 0.9, rate: 0.95 + Math.random() * 0.1 });
      combo = 0;
    } else {
      play("hit", { volume: 1, rate: 0.9 + Math.random() * 0.18 });
      if (atk.side === "p1") {
        combo += 1;
        comboT = 1.4;
      } else {
        combo = 0;
      }
    }
    if (result.ko) {
      play("ko", { volume: 1 });
      showBanner("K.O.", 2);
      const win = def.side === "p2";
      finishRound(win ? "YOU WIN" : "YOU LOSE", "KNOCKOUT");
    }
  }
}

function separate() {
  const gap = 0.62;
  if (Math.abs(p1.x - p2.x) >= gap) return;
  const mid = (p1.x + p2.x) / 2;
  const dir = p1.x <= p2.x ? -1 : 1;
  p1.x = Math.min(STAGE_MAX, Math.max(STAGE_MIN, mid + dir * gap * 0.5));
  p2.x = Math.min(STAGE_MAX, Math.max(STAGE_MIN, mid - dir * gap * 0.5));
}

function updateHud() {
  hud.p1Hp.style.transform = `scaleX(${p1.health / p1.maxHealth})`;
  hud.p2Hp.style.transform = `scaleX(${p2.health / p2.maxHealth})`;
  hud.timer.textContent = String(Math.max(0, Math.ceil(fightTime))).padStart(2, "0");
  if (combo >= 2 && comboT > 0) {
    hud.combo.textContent = `${combo} HIT`;
    hud.combo.classList.remove("hidden");
  } else {
    hud.combo.classList.add("hidden");
  }
}

function updateCamera(dt) {
  const mid = (p1.x + p2.x) * 0.5;
  const span = Math.abs(p1.x - p2.x);
  const z = -7.1 - Math.min(2.4, span * 0.22);
  camera.position.x += (mid - camera.position.x) * Math.min(1, dt * 4.5);
  camera.position.y += (2.05 - camera.position.y) * Math.min(1, dt * 3);
  camera.position.z += (z - camera.position.z) * Math.min(1, dt * 3);
  if (shake > 0) {
    camera.position.x += (Math.random() - 0.5) * shake;
    camera.position.y += (Math.random() - 0.5) * shake * 0.6;
    shake = Math.max(0, shake - dt * 1.6);
  }
  camera.lookAt(mid, 1.22, 0.9);
}

function updateSelect() {
  if (consume("left") || consume("right")) {
    selected = selected === "dragon" ? "iron" : "dragon";
    play("select", { volume: 0.7 });
  }
  document.querySelectorAll(".card").forEach((card) => {
    card.classList.toggle("selected", card.dataset.id === selected);
  });
  if (consume("start")) {
    play("select", { volume: 0.8 });
    paintDifficulty();
    show("difficulty");
  }
  if (consume("back")) show("title");
}

function updateDifficulty() {
  if (consume("left")) {
    const idx = DIFFICULTY_ORDER.indexOf(difficultyId);
    difficultyId = DIFFICULTY_ORDER[(idx - 1 + DIFFICULTY_ORDER.length) % DIFFICULTY_ORDER.length];
    play("select", { volume: 0.7 });
    paintDifficulty();
  } else if (consume("right")) {
    const idx = DIFFICULTY_ORDER.indexOf(difficultyId);
    difficultyId = DIFFICULTY_ORDER[(idx + 1) % DIFFICULTY_ORDER.length];
    play("select", { volume: 0.7 });
    paintDifficulty();
  }
  if (consume("start")) {
    play("select", { volume: 0.8 });
    startFight(selected);
  }
  if (consume("back")) show("select");
}

function updateFight(dt) {
  if (bannerT > 0) {
    bannerT -= dt;
    if (bannerT <= 0) hud.banner.classList.add("hidden");
  }
  comboT = Math.max(0, comboT - dt);

  if (hitStop > 0) {
    hitStop -= dt;
    updateHud();
    updateCamera(dt);
    return;
  }

  if (!roundLocked) {
    fightTime -= dt;
    if (fightTime <= 0) {
      fightTime = 0;
      showBanner("TIME", 1.4);
      if (p1.health === p2.health) finishRound("DRAW", "TIME UP");
      else finishRound(p1.health > p2.health ? "YOU WIN" : "YOU LOSE", "TIME UP");
    }
  }

  const playerCmd = playerInput();
  const cpuCmd = think(p2, p1, clock.elapsedTime, dt, currentDifficulty());
  p1.update(dt, playerCmd, p2);
  p2.update(dt, cpuCmd, p1);
  for (const fighter of [p1, p2]) {
    if (fighter.swingCue) {
      const heavy = fighter.swingCue === "roundhouse";
      play(fighter.swingCue === "punch" ? "punch" : "kick", {
        volume: heavy ? 1 : fighter.swingCue === "kick" ? 0.85 : 0.7,
        rate: heavy ? 0.8 + Math.random() * 0.06 : 0.94 + Math.random() * 0.12,
      });
      fighter.swingCue = null;
    }
    if (fighter.fxCue) {
      play(fighter.fxCue, { volume: 0.45, rate: 1 });
      fighter.fxCue = null;
    }
  }
  separate();
  resolveHits();
  updateSparks(dt);
  updateHud();
  updateCamera(dt);

  if (consume("back") && !roundLocked) {
    stopMusic();
    show("select");
    clearFighters();
  }
}

function tick() {
  const dt = Math.min(0.033, clock.getDelta());
  if (mode === "title") {
    if (consume("start")) {
      unlockAudio().then(() => play("select", { volume: 0.8 }));
      show("select");
    }
  } else if (mode === "select") {
    updateSelect();
  } else if (mode === "difficulty") {
    updateDifficulty();
  } else if (mode === "fight") {
    updateFight(dt);
  } else if (mode === "result") {
    if (consume("start")) startFight(selected);
    if (consume("back")) {
      show("select");
      clearFighters();
    }
  }
  renderer.render(scene, camera);
  endFrame();
  requestAnimationFrame(tick);
}

function resize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

async function boot() {
  bindInput();
  window.addEventListener("resize", resize);
  $("btn-start").addEventListener("click", () => {
    unlockAudio().then(() => play("select", { volume: 0.8 }));
    show("select");
  });
  $("btn-rematch").addEventListener("click", () => startFight(selected));
  $("btn-roster").addEventListener("click", () => {
    show("select");
    clearFighters();
  });
  document.querySelectorAll(".card").forEach((card) => {
    card.addEventListener("click", () => {
      selected = card.dataset.id;
      play("select", { volume: 0.7 });
      updateSelect();
    });
    card.addEventListener("dblclick", () => {
      selected = card.dataset.id;
      paintDifficulty();
      show("difficulty");
    });
  });
  document.querySelectorAll(".diff-card").forEach((card) => {
    card.addEventListener("click", () => {
      difficultyId = card.dataset.id;
      play("select", { volume: 0.7 });
      paintDifficulty();
    });
    card.addEventListener("dblclick", () => {
      difficultyId = card.dataset.id;
      startFight(selected);
    });
  });

  const [maps] = await Promise.all([loadGameTextures(), loadAudio()]);
  textures = maps;
  createArena(scene, textures);
  $("boot").classList.add("hidden");
  show("title");
  clock.start();
  requestAnimationFrame(tick);
}

boot().catch((err) => {
  console.error(err);
  $("boot").innerHTML = `<p>LOAD FAILED</p><p>${err.message}</p>`;
});
