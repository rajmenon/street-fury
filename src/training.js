export const POLICIES = ["stand", "block", "punish"];

export const POLICY_BLURB = {
  stand: "Dummy stands still",
  block: "Dummy holds block",
  punish: "Dummy punches after you swing",
};

export function createSession(opts = {}) {
  const policy = opts.policy ?? "stand";
  if (!POLICIES.includes(policy)) {
    throw new Error(`unknown dummy policy: ${policy}`);
  }
  return {
    active: true,
    policy,
    hits: 0,
    combo: 0,
    bestCombo: 0,
    lastMove: null,
    resets: 0,
  };
}

export function cyclePolicy(session) {
  const index = POLICIES.indexOf(session.policy);
  session.policy = POLICIES[(index + 1) % POLICIES.length];
  return session.policy;
}

export function recordConnect(session, moveKind) {
  session.hits += 1;
  session.combo += 1;
  session.bestCombo = Math.max(session.bestCombo, session.combo);
  session.lastMove = moveKind;
  return session.combo;
}

export function recordWhiffOrBlock(session) {
  session.combo = 0;
}

export function resetRound(session) {
  session.hits = 0;
  session.combo = 0;
  session.lastMove = null;
  session.resets += 1;
}

export function policyLabel(session) {
  return session.policy.toUpperCase();
}

export function policyBlurb(session) {
  return POLICY_BLURB[session.policy];
}
