import * as THREE from "three";
import {
  stancePose,
  walkPose,
  blockPose,
  hitPose,
  jumpPose,
  koPose,
  attackPose,
  applyPose,
  poseYaw,
} from "./anim.js";

const GRAVITY = 28;
export const STAGE_MIN = -8.4;
export const STAGE_MAX = 8.4;

function mat(color, extras = {}) {
  return new THREE.MeshStandardMaterial({
    color,
    roughness: 0.48,
    metalness: 0.08,
    ...extras,
  });
}

function capsule(radius, length, material) {
  const mesh = new THREE.Mesh(new THREE.CapsuleGeometry(radius, length, 5, 10), material);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

function sphere(radius, material) {
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(radius, 16, 14), material);
  mesh.castShadow = true;
  return mesh;
}

function joint() {
  const group = new THREE.Group();
  return group;
}

function buildRig(spec, textures) {
  const scale = spec.height / 1.75;
  const thick = spec.width;
  const skin = mat(spec.skin);
  const pants = mat(spec.pants);
  const wrap = mat(spec.wrap);
  const bandana = mat(spec.bandana);
  const hair = mat(spec.hair);

  const root = new THREE.Group();
  const hips = joint();
  hips.position.y = 0.92 * scale;
  root.add(hips);

  const torso = joint();
  torso.position.y = 0.16 * scale;
  hips.add(torso);

  const belly = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.16 * thick * scale, 0.28 * scale, 6, 12),
    skin,
  );
  belly.castShadow = true;
  belly.position.y = 0.16 * scale;
  torso.add(belly);

  const abs = new THREE.Mesh(
    new THREE.PlaneGeometry(0.34 * thick * scale, 0.38 * scale),
    new THREE.MeshStandardMaterial({
      map: textures.torso,
      transparent: true,
      roughness: 0.5,
      metalness: 0.05,
      depthWrite: false,
    }),
  );
  abs.position.set(0, 0.16 * scale, 0.155 * thick * scale);
  torso.add(abs);

  const chest = joint();
  chest.position.y = 0.34 * scale;
  torso.add(chest);

  const pecs = new THREE.Mesh(
    new THREE.SphereGeometry(0.17 * thick * scale, 14, 12),
    skin,
  );
  pecs.scale.set(1.15, 0.72, 0.78);
  pecs.position.y = 0.02 * scale;
  pecs.castShadow = true;
  chest.add(pecs);

  const neck = capsule(0.045 * thick * scale, 0.08 * scale, skin);
  neck.position.y = 0.16 * scale;
  chest.add(neck);

  const head = joint();
  head.position.y = 0.28 * scale;
  chest.add(head);

  const skull = sphere(0.125 * scale, skin);
  skull.scale.set(0.92, 1.05, 0.95);
  head.add(skull);

  const face = new THREE.Mesh(
    new THREE.CircleGeometry(0.13 * scale, 24),
    new THREE.MeshStandardMaterial({
      map: textures.face,
      transparent: true,
      roughness: 0.55,
      metalness: 0.02,
      depthWrite: false,
    }),
  );
  face.position.set(0, 0.01 * scale, 0.11 * scale);
  head.add(face);

  const band = new THREE.Mesh(new THREE.TorusGeometry(0.125 * scale, 0.022 * scale, 8, 18), bandana);
  band.rotation.x = Math.PI / 2;
  band.position.y = 0.05 * scale;
  band.castShadow = true;
  head.add(band);

  const tail = new THREE.Mesh(new THREE.BoxGeometry(0.04 * scale, 0.22 * scale, 0.01 * scale), bandana);
  tail.position.set(0.12 * scale, 0.02 * scale, -0.02 * scale);
  tail.rotation.z = -0.6;
  head.add(tail);

  if (spec.style === "martial") {
    const bangs = new THREE.Mesh(new THREE.SphereGeometry(0.13 * scale, 12, 10), hair);
    bangs.scale.set(1.05, 0.55, 0.9);
    bangs.position.set(0, 0.08 * scale, 0.02 * scale);
    head.add(bangs);
  } else {
    const crop = new THREE.Mesh(new THREE.SphereGeometry(0.128 * scale, 12, 10), hair);
    crop.scale.set(1.02, 0.45, 1.02);
    crop.position.y = 0.07 * scale;
    head.add(crop);
  }

  const makeArm = (side) => {
    const shoulder = joint();
    shoulder.position.set(side * 0.2 * thick * scale, 0.06 * scale, 0);
    chest.add(shoulder);
    const upper = capsule(0.045 * thick * scale, 0.22 * scale, skin);
    upper.position.y = -0.16 * scale;
    shoulder.add(upper);
    const elbow = joint();
    elbow.position.y = -0.3 * scale;
    shoulder.add(elbow);
    const forearm = capsule(0.038 * thick * scale, 0.2 * scale, spec.style === "boxer" ? wrap : skin);
    forearm.position.y = -0.14 * scale;
    elbow.add(forearm);
    const cuff = new THREE.Mesh(
      new THREE.TorusGeometry(0.042 * thick * scale, 0.016 * scale, 8, 12),
      wrap,
    );
    cuff.position.y = -0.04 * scale;
    elbow.add(cuff);
    const hand = sphere(0.045 * thick * scale, spec.style === "boxer" ? wrap : skin);
    hand.position.y = -0.28 * scale;
    elbow.add(hand);
    return { shoulder, elbow, hand };
  };

  const lArm = makeArm(-1);
  const rArm = makeArm(1);

  const waist = new THREE.Mesh(
    new THREE.CylinderGeometry(0.17 * thick * scale, 0.16 * thick * scale, 0.1 * scale, 12),
    spec.style === "boxer" ? mat(spec.stripe) : pants,
  );
  waist.position.y = -0.02 * scale;
  hips.add(waist);

  const makeLeg = (side) => {
    const hip = joint();
    hip.position.set(side * 0.09 * thick * scale, -0.04 * scale, 0);
    hips.add(hip);
    const thigh = capsule(0.065 * thick * scale, 0.28 * scale, pants);
    thigh.position.y = -0.2 * scale;
    hip.add(thigh);
    const stripe = new THREE.Mesh(
      new THREE.BoxGeometry(0.02 * scale, 0.32 * scale, 0.02 * scale),
      mat(spec.stripe),
    );
    stripe.position.set(side * 0.06 * thick * scale, -0.2 * scale, 0);
    hip.add(stripe);
    const knee = joint();
    knee.position.y = -0.38 * scale;
    hip.add(knee);
    const shin = capsule(0.05 * thick * scale, 0.28 * scale, pants);
    shin.position.y = -0.18 * scale;
    knee.add(shin);
    const foot = new THREE.Mesh(
      new THREE.BoxGeometry(0.1 * scale, 0.05 * scale, 0.18 * scale),
      spec.style === "martial" ? skin : mat(0x111111),
    );
    foot.position.set(0, -0.36 * scale, 0.03 * scale);
    foot.castShadow = true;
    knee.add(foot);
    return { hip, knee, foot };
  };

  const lLeg = makeLeg(-1);
  const rLeg = makeLeg(1);

  return {
    root,
    hips,
    torso,
    chest,
    head,
    lShoulder: lArm.shoulder,
    lElbow: lArm.elbow,
    rShoulder: rArm.shoulder,
    rElbow: rArm.elbow,
    lHand: lArm.hand,
    rHand: rArm.hand,
    lHip: lLeg.hip,
    lKnee: lLeg.knee,
    rHip: rLeg.hip,
    rKnee: rLeg.knee,
    lFoot: lLeg.foot,
    rFoot: rLeg.foot,
    scale,
    baseHipsY: 0.92 * scale,
  };
}

const ATTACKS = new Set(["punch", "kick", "roundhouse"]);
const _limb = new THREE.Vector3();

export class Fighter {
  constructor(spec, side, textures) {
    this.spec = spec;
    this.side = side;
    this.facing = side === "p1" ? 1 : -1;
    this.x = side === "p1" ? -2.5 : 2.5;
    this.y = 0;
    this.vy = 0;
    this.health = spec.health;
    this.maxHealth = spec.health;
    this.state = "idle";
    this.stateT = 0;
    this.animT = 0;
    this.stun = 0;
    this.invuln = 0;
    this.hitFlash = 0;
    this.combo = 0;
    this.air = false;
    this.blocking = false;
    this.didHit = false;
    this.lastMove = null;
    this.swingCue = null;
    this.swingArmed = false;
    this.fxCue = null;
    this.slide = 0;
    this.punchStyle = "jab";
    this.lastPunch = null;
    this.lastPunchAt = -1;
    this.hitKind = "punch";
    this.walkDir = 1;
    this.stance = stancePose(spec);
    this.poseYaw = 0;
    this.rig = buildRig(spec, {
      face: textures.faces[spec.id],
      torso: textures.torsos[spec.id],
    });
    this.root = this.rig.root;
  }

  setState(state) {
    this.state = state;
    this.stateT = 0;
    if (ATTACKS.has(state)) {
      this.didHit = false;
      this.swingArmed = false;
      this.lastMove = state;
    }
  }

  enter(state) {
    if (this.state === state) return;
    this.setState(state);
  }

  busy() {
    return ATTACKS.has(this.state) || this.state === "hit" || this.state === "ko";
  }

  move(name) {
    return this.spec[name];
  }

  holdingBack(cmd) {
    if (this.facing > 0) return cmd.left && !cmd.right;
    return cmd.right && !cmd.left;
  }

  holdingForward(cmd) {
    if (this.facing > 0) return cmd.right && !cmd.left;
    return cmd.left && !cmd.right;
  }

  attackDuration(name) {
    const move = this.move(name);
    return move.startup + move.active + move.recovery;
  }

  inLateRecovery() {
    if (!ATTACKS.has(this.state)) return false;
    const move = this.move(this.state);
    return this.stateT >= move.startup + move.active + move.recovery * 0.4;
  }

  startAttack(kind) {
    if (kind === "punch") {
      const chain = this.lastPunch === "jab" && this.animT - this.lastPunchAt < 0.55;
      this.punchStyle = chain ? "cross" : "jab";
      this.lastPunch = this.punchStyle;
      this.lastPunchAt = this.animT;
      this.slide = this.punchStyle === "cross" ? 0.46 : 0.38;
    } else if (kind === "kick") {
      this.slide = 0.4;
    } else {
      this.slide = 0.3;
    }
    this.setState(kind);
  }

  update(dt, cmd, opponent) {
    this.stateT += dt;
    this.animT += dt;
    this.invuln = Math.max(0, this.invuln - dt);
    this.hitFlash = Math.max(0, this.hitFlash - dt);

    if (this.y > 0 || this.vy > 0) {
      this.vy -= GRAVITY * dt;
      this.y += this.vy * dt;
      if (this.y <= 0) {
        this.y = 0;
        this.vy = 0;
        if (this.air) this.fxCue = "land";
        this.air = false;
        if (this.state === "jump") this.enter("idle");
      } else {
        this.air = true;
      }
    }

    if (opponent && (!this.busy() || this.state === "hit")) {
      this.facing = opponent.x >= this.x ? 1 : -1;
    }

    if (this.slide > 0 && ATTACKS.has(this.state)) {
      const step = Math.min(this.slide, 6.2 * dt);
      this.x += this.facing * step;
      this.slide -= step;
    }

    if (this.state === "ko") {
      this.animate(dt);
      this.syncTransform();
      return;
    }

    if (this.state === "hit") {
      if (this.stateT >= this.stun) this.enter("idle");
      this.animate(dt);
      this.syncTransform();
      return;
    }

    const wantPunch = cmd.punchPressed;
    const wantKick = cmd.kickPressed;
    const wantHouse = cmd.roundhousePressed;

    if (ATTACKS.has(this.state)) {
      const move = this.move(this.state);
      if (!this.swingArmed && this.stateT >= move.startup) {
        this.swingArmed = true;
        this.swingCue = this.state;
      }
      if (this.inLateRecovery() && !this.blocking) {
        if (wantHouse) {
          this.startAttack("roundhouse");
          this.animate(dt);
          this.syncTransform();
          return;
        }
        if (wantPunch) {
          this.startAttack("punch");
          this.animate(dt);
          this.syncTransform();
          return;
        }
        if (wantKick) {
          this.startAttack("kick");
          this.animate(dt);
          this.syncTransform();
          return;
        }
      }
      if (this.stateT >= this.attackDuration(this.state)) this.setState(this.air ? "jump" : "idle");
      this.x = Math.min(STAGE_MAX, Math.max(STAGE_MIN, this.x));
      this.animate(dt);
      this.syncTransform();
      return;
    }

    this.blocking = Boolean(!this.air && (cmd.down || this.holdingBack(cmd)));
    let moving = false;
    this.walkDir = 1;

    if (cmd.upPressed && !this.air && !this.blocking) {
      this.vy = this.spec.jump;
      this.air = true;
      this.fxCue = "jump";
      this.enter("jump");
    }

    if (!this.blocking && !this.air) {
      if (cmd.left) {
        this.x -= this.spec.speed * dt;
        moving = true;
        this.walkDir = this.facing > 0 ? -1 : 1;
      }
      if (cmd.right) {
        this.x += this.spec.speed * dt;
        moving = true;
        this.walkDir = this.facing > 0 ? 1 : -1;
      }
    } else if (this.air) {
      if (cmd.left) this.x -= this.spec.speed * 0.72 * dt;
      if (cmd.right) this.x += this.spec.speed * 0.72 * dt;
    }

    if (!this.blocking && wantHouse) this.startAttack("roundhouse");
    else if (!this.blocking && wantPunch) this.startAttack("punch");
    else if (!this.blocking && wantKick) this.startAttack("kick");
    else if (this.blocking) this.enter("block");
    else if (this.air) this.enter("jump");
    else if (moving) this.enter("walk");
    else this.enter("idle");

    this.x = Math.min(STAGE_MAX, Math.max(STAGE_MIN, this.x));
    this.animate(dt);
    this.syncTransform();
  }

  attackLimb() {
    if (this.state === "punch") return this.punchStyle === "jab" ? this.rig.lHand : this.rig.rHand;
    return this.rig.rFoot;
  }

  attackBox() {
    if (!ATTACKS.has(this.state)) return null;
    const move = this.move(this.state);
    if (this.stateT < move.startup || this.stateT > move.startup + move.active) return null;

    this.root.updateMatrixWorld(true);
    this.attackLimb().getWorldPosition(_limb);
    const reach = (_limb.x - this.x) * this.facing;
    if (reach < 0.22) return null;

    let damage = this.spec.kickDamage;
    if (this.state === "punch") damage = this.punchStyle === "cross" ? Math.round(this.spec.punchDamage * 1.2) : Math.round(this.spec.punchDamage * 0.8);
    if (this.state === "roundhouse") damage = this.spec.roundhouseDamage;

    return {
      x: _limb.x,
      y: _limb.y,
      r: this.state === "roundhouse" ? 0.4 : this.state === "kick" ? 0.36 : 0.3,
      damage,
      stun: move.stun,
      knock: this.state === "roundhouse" ? 2.8 : this.state === "kick" ? 2.1 : this.punchStyle === "cross" ? 1.6 : 1.15,
      kind: this.state,
    };
  }

  hurtBox() {
    return {
      x: this.x,
      bottom: 0.18 + this.y,
      top: 1.72 * this.rig.scale + this.y,
      r: 0.22 * this.spec.width + 0.2,
    };
  }

  takeHit(box, blocked) {
    if (this.state === "ko" || this.invuln > 0) return { dealt: 0, ko: false, blocked };
    const damage = blocked ? Math.ceil(box.damage * 0.16) : box.damage;
    this.health = Math.max(0, this.health - damage);
    this.x += this.facing * -1 * (blocked ? 0.16 : box.knock * 0.14);
    this.x = Math.min(STAGE_MAX, Math.max(STAGE_MIN, this.x));
    this.hitFlash = 0.14;
    this.slide = 0;
    this.hitKind = box.kind;
    if (this.health <= 0) {
      this.setState("ko");
      this.vy = 3.4;
      this.y = Math.max(this.y, 0.05);
      return { dealt: damage, ko: true, blocked };
    }
    if (!blocked) {
      this.setState("hit");
      this.stun = box.stun;
      this.invuln = 0.07;
    }
    return { dealt: damage, ko: false, blocked };
  }

  animate(dt) {
    const stance = this.stance;
    let pose = stance;
    let snap = false;

    if (this.state === "walk") {
      pose = walkPose(stance, this.animT, this.walkDir > 0);
    } else if (this.state === "idle") {
      pose = { ...stance, hipsY: (stance.hipsY || 0) + Math.sin(this.animT * 2.3) * 0.012 };
    } else if (this.state === "block") {
      pose = blockPose(stance);
      snap = true;
    } else if (ATTACKS.has(this.state)) {
      pose = attackPose(this.state, this.punchStyle, stance, this.stateT);
      snap = true;
    } else if (this.state === "hit") {
      pose = hitPose(stance, this.hitKind);
      snap = true;
    } else if (this.state === "jump") {
      pose = jumpPose(stance);
    } else if (this.state === "ko") {
      pose = koPose();
      snap = true;
    }

    applyPose(this.rig, pose, dt, snap);
    this.poseYaw = poseYaw(pose);

    const flash = this.hitFlash > 0;
    this.rig.root.traverse((child) => {
      if (child.isMesh && child.material && child.material.emissive) {
        child.material.emissive.setHex(flash ? 0xff5533 : 0x000000);
        child.material.emissiveIntensity = flash ? 0.7 : 0;
      }
    });
  }

  syncTransform() {
    this.root.position.set(this.x, this.y, 0);
    const sideOn = ATTACKS.has(this.state) ? 0.28 : 0.5;
    this.root.rotation.y = this.facing * (Math.PI / 2 + sideOn) + this.facing * this.poseYaw;
    this.root.updateMatrixWorld(true);
  }
}

export function overlapping(a, b) {
  const dx = a.x - b.x;
  const nearestY = b.top != null ? Math.min(b.top, Math.max(b.bottom, a.y)) : b.y;
  const dy = a.y - nearestY;
  const r = a.r + b.r;
  return dx * dx + dy * dy <= r * r;
}
