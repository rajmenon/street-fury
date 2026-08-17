import { emptyInput } from "./input.js";
import { DIFFICULTIES } from "./difficulty.js";

let delay = 0;
let held = emptyInput();

export function resetAi() {
  delay = 0;
  held = emptyInput();
}

function swinging(fighter) {
  return fighter.state === "punch" || fighter.state === "kick" || fighter.state === "roundhouse";
}

export function think(cpu, player, time, dt, diff = DIFFICULTIES.medium) {
  const cmd = emptyInput();
  if (cpu.state === "ko" || cpu.state === "hit") {
    delay = 0;
    return cmd;
  }

  const dist = player.x - cpu.x;
  const adist = Math.abs(dist);
  const towardLeft = dist < 0;
  const towardRight = dist > 0;
  const pulse = (Math.sin(time * 3.1 + cpu.x) + 1) * 0.5;
  const hurt = cpu.health / cpu.maxHealth < 0.35;
  const aggro = hurt ? Math.min(1, diff.aggro + 0.22) : diff.aggro;
  const playerSwinging = swinging(player);

  if (playerSwinging && adist < 1.85 && Math.random() < diff.blockChance) {
    cmd.down = true;
    cmd.left = towardRight;
    cmd.right = towardLeft;
    delay = 0;
    held = cmd;
    return cmd;
  }

  if (player.state === "kick" || player.state === "roundhouse") {
    if (adist < 2.2 && cpu.y === 0 && Math.random() < diff.jumpPunish) {
      cmd.up = true;
      cmd.upPressed = true;
      delay = 0;
      held = cmd;
      return cmd;
    }
  }

  delay -= dt;
  if (delay > 0) return held;

  delay = diff.reaction * (0.55 + Math.random() * 0.9);

  if (player.state === "hit" && adist < cpu.spec.roundhouseRange && Math.random() < diff.followUp) {
    if (adist < cpu.spec.punchRange && pulse < 0.55) {
      cmd.punchPressed = true;
      cmd.punch = true;
    } else {
      cmd.roundhousePressed = true;
      cmd.roundhouse = true;
    }
    held = cmd;
    return cmd;
  }

  if (adist > cpu.spec.roundhouseRange + 0.2) {
    cmd.left = towardLeft;
    cmd.right = towardRight;
    if (cpu.y === 0 && Math.random() < diff.approachJump) {
      cmd.up = true;
      cmd.upPressed = true;
    }
    held = cmd;
    return cmd;
  }

  if (adist < 0.7) {
    if (pulse < 0.35) {
      cmd.left = !towardLeft;
      cmd.right = !towardRight;
    } else if (pulse < 0.55) {
      cmd.down = true;
    }
  }

  if (cpu.busy()) {
    held = cmd;
    return cmd;
  }

  if (Math.random() < diff.missIdle) {
    held = cmd;
    return cmd;
  }

  const punchRange = cpu.spec.punchRange + 0.08;
  const kickRange = cpu.spec.kickRange + 0.1;
  const houseRange = cpu.spec.roundhouseRange + 0.08;

  if (adist < houseRange && adist > punchRange * 0.85 && Math.random() < diff.roundhouseChance) {
    cmd.roundhousePressed = true;
    cmd.roundhouse = true;
  } else if (adist < punchRange && pulse < aggro) {
    cmd.punchPressed = true;
    cmd.punch = true;
  } else if (adist < kickRange && pulse > 1 - aggro * 0.7) {
    cmd.kickPressed = true;
    cmd.kick = true;
  } else if (adist > 0.85) {
    cmd.left = towardLeft;
    cmd.right = towardRight;
  }

  held = cmd;
  return cmd;
}
