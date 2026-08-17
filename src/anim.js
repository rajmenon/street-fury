const PARTS = [
  "lShoulder",
  "rShoulder",
  "lElbow",
  "rElbow",
  "lHip",
  "rHip",
  "lKnee",
  "rKnee",
  "torso",
  "head",
  "hips",
];

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function damp(current, target, lambda, dt) {
  return lerp(current, target, 1 - Math.exp(-lambda * dt));
}

function easeInOut(t) {
  return t * t * (3 - 2 * t);
}

function easeOut(t) {
  return 1 - (1 - t) * (1 - t);
}

function easeIn(t) {
  return t * t;
}

function clonePose(pose) {
  const out = { hipsY: pose.hipsY || 0, yaw: pose.yaw || 0 };
  for (const key of PARTS) {
    out[key] = (pose[key] || [0, 0, 0]).slice();
  }
  return out;
}

function mixPose(a, b, t) {
  const out = { hipsY: lerp(a.hipsY || 0, b.hipsY || 0, t), yaw: lerp(a.yaw || 0, b.yaw || 0, t) };
  for (const key of PARTS) {
    const pa = a[key] || [0, 0, 0];
    const pb = b[key] || [0, 0, 0];
    out[key] = [lerp(pa[0], pb[0], t), lerp(pa[1], pb[1], t), lerp(pa[2], pb[2], t)];
  }
  return out;
}

export function stancePose(spec) {
  if (spec.style === "boxer") {
    return {
      lShoulder: [-0.95, 0.18, 1.2],
      rShoulder: [-1.0, -0.18, -1.2],
      lElbow: [-1.55, 0.22, 0.12],
      rElbow: [-1.55, -0.22, -0.12],
      lHip: [0.2, 0.04, 0.1],
      rHip: [0.08, -0.04, -0.1],
      lKnee: [0.32, 0, 0],
      rKnee: [0.2, 0, 0],
      torso: [0.16, 0.1, 0],
      head: [0.08, 0.04, 0],
      hips: [0.04, 0.1, 0],
      hipsY: -0.04,
      yaw: 0.08,
    };
  }
  return {
    lShoulder: [-0.5, 0.22, 0.75],
    rShoulder: [-0.88, -0.12, -0.42],
    lElbow: [-0.65, 0.18, 0.05],
    rElbow: [-1.15, 0.05, 0],
    lHip: [0.1, 0.06, 0.14],
    rHip: [0.24, -0.04, -0.06],
    lKnee: [0.18, 0, 0],
    rKnee: [0.32, 0, 0],
    torso: [0.05, 0.14, 0],
    head: [0.02, 0.1, 0],
    hips: [0.02, 0.12, 0],
    hipsY: 0,
    yaw: 0.06,
  };
}

export function walkPose(stance, time, movingForward) {
  const phase = time * 9.2;
  const swing = Math.sin(phase);
  const lift = Math.max(0, Math.sin(phase));
  const liftB = Math.max(0, Math.sin(phase + Math.PI));
  const dir = movingForward ? 1 : -1;
  const pose = clonePose(stance);
  pose.lHip = [dir * swing * 0.72, 0.04, 0.08];
  pose.rHip = [dir * -swing * 0.72, -0.04, -0.08];
  pose.lKnee = [0.12 + lift * 0.95, 0, 0];
  pose.rKnee = [0.12 + liftB * 0.95, 0, 0];
  pose.lShoulder = [stance.lShoulder[0] - dir * swing * 0.55, stance.lShoulder[1], stance.lShoulder[2]];
  pose.rShoulder = [stance.rShoulder[0] + dir * swing * 0.55, stance.rShoulder[1], stance.rShoulder[2]];
  pose.hips = [0.03, swing * 0.08, 0];
  pose.torso = [stance.torso[0], stance.torso[1] + swing * 0.06, swing * 0.04];
  pose.hipsY = (stance.hipsY || 0) + Math.abs(swing) * 0.035;
  return pose;
}

export function blockPose(stance) {
  return mixPose(stance, {
    lShoulder: [-1.25, 0.28, 1.15],
    rShoulder: [-1.25, -0.28, -1.15],
    lElbow: [-1.7, 0.15, 0.2],
    rElbow: [-1.7, -0.15, -0.2],
    lHip: [0.28, 0.05, 0.1],
    rHip: [0.22, -0.05, -0.1],
    lKnee: [0.55, 0, 0],
    rKnee: [0.5, 0, 0],
    torso: [0.28, 0.05, 0],
    head: [0.12, 0, 0],
    hips: [0.08, 0, 0],
    hipsY: -0.1,
    yaw: 0.02,
  }, 1);
}

function sampleKeys(keys, t) {
  if (t <= keys[0].t) return keys[0].pose;
  const last = keys[keys.length - 1];
  if (t >= last.t) return last.pose;
  for (let i = 0; i < keys.length - 1; i += 1) {
    const a = keys[i];
    const b = keys[i + 1];
    if (t >= a.t && t <= b.t) {
      const u = (t - a.t) / Math.max(0.0001, b.t - a.t);
      const e = a.ease ? a.ease(u) : easeInOut(u);
      return mixPose(a.pose, b.pose, e);
    }
  }
  return last.pose;
}

export function jabKeys(stance) {
  const chamber = mixPose(stance, {
    lShoulder: [-0.25, 0.15, 0.9],
    rShoulder: [-1.05, -0.2, -0.7],
    lElbow: [-1.35, 0.3, 0.15],
    rElbow: [-1.35, 0, 0],
    torso: [0.08, -0.18, 0.04],
    hips: [0.04, -0.2, 0],
    hipsY: -0.02,
  }, 1);
  const extend = {
    lShoulder: [-1.72, 0.12, 0.18],
    rShoulder: [-1.05, -0.15, -0.85],
    lElbow: [-0.08, 0.05, 0],
    rElbow: [-1.4, 0, 0],
    lHip: [0.05, 0.08, 0.12],
    rHip: [0.32, -0.06, -0.08],
    lKnee: [0.15, 0, 0],
    rKnee: [0.38, 0, 0],
    torso: [0.04, 0.28, -0.06],
    head: [0.04, -0.12, 0],
    hips: [0.02, 0.32, 0],
    hipsY: 0.02,
    yaw: -0.12,
  };
  const recover = mixPose(stance, extend, 0.2);
  return [
    { t: 0, pose: stance, ease: easeIn },
    { t: 0.035, pose: chamber, ease: easeOut },
    { t: 0.09, pose: extend, ease: easeOut },
    { t: 0.2, pose: recover, ease: easeInOut },
    { t: 0.3, pose: stance, ease: easeInOut },
  ];
}

export function crossKeys(stance) {
  const load = mixPose(stance, {
    lShoulder: [-0.85, 0.25, 0.95],
    rShoulder: [-0.35, -0.2, -0.95],
    rElbow: [-1.45, -0.25, -0.2],
    lElbow: [-1.2, 0.2, 0.15],
    torso: [0.1, -0.35, 0.08],
    hips: [0.06, -0.4, 0],
    rHip: [0.35, 0, -0.1],
    hipsY: -0.03,
    yaw: 0.08,
  }, 1);
  const extend = {
    lShoulder: [-0.95, 0.2, 0.85],
    rShoulder: [-1.85, -0.08, -0.12],
    lElbow: [-1.25, 0.15, 0.1],
    rElbow: [0.05, 0, 0],
    lHip: [0.28, 0.08, 0.1],
    rHip: [0.06, -0.08, -0.06],
    lKnee: [0.35, 0, 0],
    rKnee: [0.12, 0, 0],
    torso: [0.06, 0.42, -0.1],
    head: [0.06, -0.18, 0],
    hips: [0.04, 0.48, 0],
    hipsY: 0.03,
    yaw: -0.16,
  };
  return [
    { t: 0, pose: stance, ease: easeIn },
    { t: 0.05, pose: load, ease: easeOut },
    { t: 0.12, pose: extend, ease: easeOut },
    { t: 0.24, pose: mixPose(stance, extend, 0.25), ease: easeInOut },
    { t: 0.36, pose: stance, ease: easeInOut },
  ];
}

export function kickKeys(stance) {
  const chamber = {
    lShoulder: [-0.85, 0.15, 0.7],
    rShoulder: [-1.05, -0.2, -0.55],
    lElbow: [-0.9, 0.1, 0],
    rElbow: [-1.1, 0, 0],
    lHip: [0.18, 0.05, 0.12],
    rHip: [-1.15, 0.15, 0.35],
    lKnee: [0.25, 0, 0],
    rKnee: [1.55, 0, 0],
    torso: [0.18, -0.08, 0.06],
    head: [0.08, 0.08, 0],
    hips: [0.06, -0.12, 0],
    hipsY: 0.04,
    yaw: 0.04,
  };
  const snap = {
    lShoulder: [-0.7, 0.1, 0.55],
    rShoulder: [-1.2, -0.25, -0.4],
    lElbow: [-0.7, 0, 0],
    rElbow: [-1.15, 0, 0],
    lHip: [0.12, 0.08, 0.16],
    rHip: [-2.05, 0.08, 0.12],
    lKnee: [0.18, 0, 0],
    rKnee: [0.08, 0, 0],
    torso: [0.22, 0.18, -0.08],
    head: [0.1, -0.06, 0],
    hips: [0.1, 0.22, 0],
    hipsY: 0.06,
    yaw: -0.1,
  };
  const recock = mixPose(chamber, snap, 0.15);
  return [
    { t: 0, pose: stance, ease: easeIn },
    { t: 0.08, pose: chamber, ease: easeOut },
    { t: 0.14, pose: snap, ease: easeOut },
    { t: 0.24, pose: recock, ease: easeInOut },
    { t: 0.36, pose: stance, ease: easeInOut },
  ];
}

export function roundhouseKeys(stance) {
  const chamber = {
    lShoulder: [-1.0, 0.2, 0.85],
    rShoulder: [-1.15, -0.25, -0.7],
    lElbow: [-1.1, 0.15, 0],
    rElbow: [-1.2, 0, 0],
    lHip: [0.22, 0.12, 0.18],
    rHip: [-1.2, 0.7, 0.95],
    lKnee: [0.35, 0, 0],
    rKnee: [1.45, 0.15, 0],
    torso: [0.12, 0.55, 0.1],
    head: [0.04, -0.15, 0],
    hips: [0.08, 0.7, 0],
    hipsY: 0.05,
    yaw: 0.18,
  };
  const whip = {
    lShoulder: [-0.85, 0.1, 0.6],
    rShoulder: [-1.25, -0.2, -0.35],
    lElbow: [-0.85, 0, 0],
    rElbow: [-1.05, 0, 0],
    lHip: [0.15, 0.18, 0.2],
    rHip: [-0.45, 1.45, -2.15],
    lKnee: [0.28, 0, 0],
    rKnee: [0.12, 0, 0],
    torso: [0.16, 1.2, -0.12],
    head: [0.08, -0.35, 0],
    hips: [0.1, 1.35, 0],
    hipsY: 0.08,
    yaw: -0.22,
  };
  const follow = mixPose(whip, {
    rHip: [-0.2, 1.1, -1.4],
    torso: [0.2, 0.7, -0.08],
    hips: [0.08, 0.7, 0],
    hipsY: 0.02,
    yaw: -0.08,
  }, 1);
  return [
    { t: 0, pose: stance, ease: easeIn },
    { t: 0.1, pose: chamber, ease: easeOut },
    { t: 0.2, pose: whip, ease: easeOut },
    { t: 0.32, pose: follow, ease: easeInOut },
    { t: 0.48, pose: stance, ease: easeInOut },
  ];
}

export function hitPose(stance, kind) {
  if (kind === "kick") {
    return {
      lShoulder: [0.35, 0.25, 0.7],
      rShoulder: [0.25, -0.2, -0.7],
      lElbow: [-0.7, 0, 0],
      rElbow: [-0.6, 0, 0],
      lHip: [0.15, 0.1, 0.15],
      rHip: [0.2, -0.1, -0.1],
      lKnee: [0.45, 0, 0],
      rKnee: [0.4, 0, 0],
      torso: [0.45, 0, 0],
      head: [0.2, 0, 0],
      hips: [0.15, 0, 0],
      hipsY: -0.06,
      yaw: 0.05,
    };
  }
  if (kind === "roundhouse") {
    return {
      lShoulder: [0.55, 0.4, 0.9],
      rShoulder: [0.45, -0.35, -0.8],
      lElbow: [-0.4, 0.2, 0],
      rElbow: [-0.35, -0.2, 0],
      lHip: [0.05, 0.2, 0.25],
      rHip: [0.35, -0.15, -0.2],
      lKnee: [0.25, 0, 0],
      rKnee: [0.55, 0, 0],
      torso: [0.25, -0.45, 0.15],
      head: [0.45, -0.25, 0],
      hips: [0.12, -0.4, 0],
      hipsY: -0.04,
      yaw: 0.2,
    };
  }
  return {
    lShoulder: [0.45, 0.3, 0.85],
    rShoulder: [0.35, -0.25, -0.75],
    lElbow: [-0.55, 0.15, 0],
    rElbow: [-0.5, -0.1, 0],
    lHip: [0.12, 0.08, 0.12],
    rHip: [0.18, -0.08, -0.1],
    lKnee: [0.35, 0, 0],
    rKnee: [0.3, 0, 0],
    torso: [0.38, -0.12, 0],
    head: [0.42, -0.08, 0],
    hips: [0.1, -0.12, 0],
    hipsY: -0.03,
    yaw: 0.12,
  };
}

export function jumpPose(stance) {
  return {
    lShoulder: [-2.15, 0.15, 0.35],
    rShoulder: [-2.05, -0.15, -0.35],
    lElbow: [-0.55, 0, 0],
    rElbow: [-0.5, 0, 0],
    lHip: [-0.85, 0.08, 0.12],
    rHip: [-0.55, -0.06, -0.1],
    lKnee: [1.25, 0, 0],
    rKnee: [0.95, 0, 0],
    torso: [0.08, 0, 0],
    head: [-0.05, 0, 0],
    hips: [0, 0, 0],
    hipsY: 0.02,
    yaw: 0,
  };
}

export function koPose() {
  return {
    lShoulder: [0.6, 0.4, 0.7],
    rShoulder: [0.5, -0.35, -0.7],
    lElbow: [-0.3, 0, 0],
    rElbow: [-0.25, 0, 0],
    lHip: [-0.15, 0.35, 0.4],
    rHip: [0.45, -0.25, -0.35],
    lKnee: [0.4, 0, 0],
    rKnee: [0.7, 0, 0],
    torso: [1.15, 0.15, 0],
    head: [0.7, 0.1, 0],
    hips: [0.35, 0.2, 0],
    hipsY: -0.55,
    yaw: 0.25,
  };
}

export function attackPose(kind, punchStyle, stance, t) {
  if (kind === "punch") return sampleKeys(punchStyle === "cross" ? crossKeys(stance) : jabKeys(stance), t);
  if (kind === "kick") return sampleKeys(kickKeys(stance), t);
  if (kind === "roundhouse") return sampleKeys(roundhouseKeys(stance), t);
  return stance;
}

export function applyPose(rig, pose, dt, snap) {
  const lambda = snap ? 46 : 15;
  for (const key of PARTS) {
    const node = rig[key];
    const xyz = pose[key] || [0, 0, 0];
    node.rotation.x = damp(node.rotation.x, xyz[0], lambda, dt);
    node.rotation.y = damp(node.rotation.y, xyz[1], lambda, dt);
    node.rotation.z = damp(node.rotation.z, xyz[2], lambda, dt);
  }
  const hipsY = rig.baseHipsY + (pose.hipsY || 0);
  rig.hips.position.y = damp(rig.hips.position.y, hipsY, lambda, dt);
}

export function poseYaw(pose) {
  return pose.yaw || 0;
}
