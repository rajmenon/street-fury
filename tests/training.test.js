import { test } from "node:test";
import assert from "node:assert/strict";
import {
  createSession,
  cyclePolicy,
  recordConnect,
  recordWhiffOrBlock,
  resetRound,
  policyLabel,
} from "../src/training.js";

test("createSession starts on stand with empty combo", () => {
  const session = createSession();
  assert.equal(session.policy, "stand");
  assert.equal(session.hits, 0);
  assert.equal(session.combo, 0);
  assert.equal(session.bestCombo, 0);
  assert.equal(session.resets, 0);
});

test("createSession rejects unknown policies", () => {
  assert.throws(() => createSession({ policy: "taunt" }), /unknown dummy policy/);
});

test("cyclePolicy walks stand -> block -> punish -> stand", () => {
  const session = createSession();
  assert.equal(cyclePolicy(session), "block");
  assert.equal(cyclePolicy(session), "punish");
  assert.equal(cyclePolicy(session), "stand");
});

test("recordConnect grows combo and keeps the best", () => {
  const session = createSession();
  recordConnect(session, "punch");
  recordConnect(session, "kick");
  assert.equal(session.hits, 2);
  assert.equal(session.combo, 2);
  assert.equal(session.bestCombo, 2);
  assert.equal(session.lastMove, "kick");
  recordWhiffOrBlock(session);
  recordConnect(session, "roundhouse");
  assert.equal(session.combo, 1);
  assert.equal(session.bestCombo, 2);
});

test("resetRound clears live stats but keeps bestCombo", () => {
  const session = createSession();
  recordConnect(session, "punch");
  recordConnect(session, "punch");
  resetRound(session);
  assert.equal(session.hits, 0);
  assert.equal(session.combo, 0);
  assert.equal(session.lastMove, null);
  assert.equal(session.bestCombo, 2);
  assert.equal(session.resets, 1);
  assert.equal(policyLabel(session), "STAND");
});
