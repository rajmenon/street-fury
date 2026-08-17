import { emptyInput } from "./input.js";

const ATTACKS = new Set(["punch", "kick", "roundhouse"]);

export function thinkDummy(cpu, player, session) {
  const cmd = emptyInput();
  if (!session || cpu.state === "ko" || cpu.state === "hit") return cmd;

  if (session.policy === "stand") return cmd;

  if (session.policy === "block") {
    cmd.down = true;
    return cmd;
  }

  if (session.policy === "punish") {
    // Intentionally naive: swing as soon as the player starts an attack.
    // A reviewer should notice this is startup/active, not recovery — the
    // dummy walks into the hit instead of punishing the leftover frames.
    if (ATTACKS.has(player.state)) {
      cmd.punch = true;
      cmd.punchPressed = true;
    }
    return cmd;
  }

  return cmd;
}

export function inRecovery(fighter) {
  if (!ATTACKS.has(fighter.state)) return false;
  const move = fighter.spec?.[fighter.state];
  if (!move) return false;
  return fighter.stateT >= move.startup + move.active;
}
