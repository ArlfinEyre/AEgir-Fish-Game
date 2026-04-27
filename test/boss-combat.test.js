import test from "node:test";
import assert from "node:assert/strict";

import {
  BOSS_COMBAT,
  INITIAL_HP,
  getBossDamagePerHit,
} from "../src/config.js";

test("boss DoT scales with initial HP", () => {
  assert.equal(
    BOSS_COMBAT.dotDamagePerSecond,
    Math.round(INITIAL_HP * 0.022),
  );
});

test("getBossDamagePerHit uses width ratio tiers", () => {
  assert.equal(getBossDamagePerHit(50, 100), BOSS_COMBAT.damageByTier[0]);
  assert.equal(getBossDamagePerHit(120, 100), BOSS_COMBAT.damageByTier[1]);
  assert.equal(getBossDamagePerHit(200, 100), BOSS_COMBAT.damageByTier[2]);
});
