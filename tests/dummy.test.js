import { test } from "node:test";
import assert from "node:assert/strict";
import { thinkDummy, inRecovery } from "../src/dummy.js";
import { createSession } from "../src/training.js";

function fighter(overrides = {}) {
  return {
    state: "idle",
    stateT: 0,
    spec: {
      punch: { startup: 0.08, active: 0.1, recovery: 0.14 },
    },
    ...overrides,
  };
}

test("stand policy emits an empty command", () => {
  const cmd = thinkDummy(fighter(), fighter(), createSession({ policy: "stand" }));
  assert.equal(cmd.down, false);
  assert.equal(cmd.punch, false);
});

test("block policy holds down", () => {
  const cmd = thinkDummy(fighter(), fighter(), createSession({ policy: "block" }));
  assert.equal(cmd.down, true);
});

test("punish policy punches while the player is attacking", () => {
  const player = fighter({ state: "punch", stateT: 0.02 });
  const cmd = thinkDummy(fighter(), player, createSession({ policy: "punish" }));
  assert.equal(cmd.punch, true);
  assert.equal(cmd.punchPressed, true);
});

test("inRecovery is true only after startup+active", () => {
  const during = fighter({ state: "punch", stateT: 0.1 });
  const after = fighter({ state: "punch", stateT: 0.2 });
  assert.equal(inRecovery(during), false);
  assert.equal(inRecovery(after), true);
});
