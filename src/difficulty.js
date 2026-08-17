export const DIFFICULTIES = {
  easy: {
    id: "easy",
    name: "EASY",
    blurb: "CPU hesitates and hits softer",
    cpuSpeed: 0.72,
    cpuDamage: 0.7,
    blockChance: 0.14,
    jumpPunish: 0.06,
    aggro: 0.28,
    reaction: 0.36,
    missIdle: 0.3,
    roundhouseChance: 0.08,
    followUp: 0.08,
    approachJump: 0.03,
  },
  medium: {
    id: "medium",
    name: "MEDIUM",
    blurb: "A fair street fight",
    cpuSpeed: 1,
    cpuDamage: 1,
    blockChance: 0.42,
    jumpPunish: 0.32,
    aggro: 0.52,
    reaction: 0.13,
    missIdle: 0.08,
    roundhouseChance: 0.28,
    followUp: 0.4,
    approachJump: 0.1,
  },
  hard: {
    id: "hard",
    name: "HARD",
    blurb: "CPU hunts, blocks, and punishes",
    cpuSpeed: 1.16,
    cpuDamage: 1.18,
    blockChance: 0.74,
    jumpPunish: 0.72,
    aggro: 0.8,
    reaction: 0.035,
    missIdle: 0,
    roundhouseChance: 0.5,
    followUp: 0.78,
    approachJump: 0.18,
  },
};

export const DIFFICULTY_ORDER = ["easy", "medium", "hard"];

export function tuneSpec(spec, diff, isCpu) {
  if (!isCpu) return { ...spec };
  return {
    ...spec,
    speed: spec.speed * diff.cpuSpeed,
    punchDamage: Math.max(1, Math.round(spec.punchDamage * diff.cpuDamage)),
    kickDamage: Math.max(1, Math.round(spec.kickDamage * diff.cpuDamage)),
    roundhouseDamage: Math.max(1, Math.round(spec.roundhouseDamage * diff.cpuDamage)),
  };
}
