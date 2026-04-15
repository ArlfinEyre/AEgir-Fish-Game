import test from "node:test";
import assert from "node:assert/strict";

import {
  ENTITY_CATEGORIES,
  HP_RECOVERY_GROWTH_STEP,
  PLAYER_INVINCIBILITY_FRAMES,
} from "../src/config.js";
import {
  applyCollisionResult,
  calculateGrowth,
  getCollisionOutcome,
  getRandomVariant,
  shouldRecoverHp,
} from "../src/systems/rules.js";

test("getRandomVariant respects weight ordering", () => {
  const variants = [
    { id: "a", weight: 10 },
    { id: "b", weight: 20 },
  ];

  assert.equal(getRandomVariant(variants, () => 0).id, "a");
  assert.equal(getRandomVariant(variants, () => 0.99).id, "b");
});

test("calculateGrowth grows with eaten area", () => {
  assert.equal(calculateGrowth(400), 2);
});

test("shouldRecoverHp checks the V2 growth threshold", () => {
  assert.equal(shouldRecoverHp(200, 200 - HP_RECOVERY_GROWTH_STEP), true);
  assert.equal(shouldRecoverHp(200, 121), false);
});

test("getCollisionOutcome rewards eating an allowed fish", () => {
  assert.deepEqual(
    getCollisionOutcome({
      category: ENTITY_CATEGORIES.FISH,
      playerWidth: 100,
      entityWidth: 110,
      entityArea: 400,
      entityScoreValue: 3,
      playerInvincibleTimer: 0,
    }),
    {
      removeEntity: true,
      scoreDelta: 3,
      hpDelta: 0,
      targetWidthDelta: 2,
      nextInvincibleTimer: 0,
      shouldGrow: true,
      shouldPlayInteract: true,
    },
  );
});

test("getCollisionOutcome damages player on larger fish", () => {
  assert.deepEqual(
    getCollisionOutcome({
      category: ENTITY_CATEGORIES.FISH,
      playerWidth: 100,
      entityWidth: 130,
      entityArea: 400,
      entityScoreValue: 3,
      playerInvincibleTimer: 0,
    }),
    {
      removeEntity: false,
      scoreDelta: 0,
      hpDelta: -1,
      targetWidthDelta: 0,
      nextInvincibleTimer: PLAYER_INVINCIBILITY_FRAMES,
      shouldGrow: false,
      shouldPlayInteract: true,
    },
  );
});

test("getCollisionOutcome keeps invincible player from taking extra damage", () => {
  assert.deepEqual(
    getCollisionOutcome({
      category: ENTITY_CATEGORIES.PUNISH,
      playerWidth: 100,
      entityWidth: 130,
      entityArea: 400,
      entityScoreValue: -10,
      playerInvincibleTimer: 10,
    }),
    {
      removeEntity: true,
      scoreDelta: -10,
      hpDelta: 0,
      targetWidthDelta: 0,
      nextInvincibleTimer: 10,
      shouldGrow: false,
      shouldPlayInteract: false,
    },
  );
});

test("applyCollisionResult heals when the growth threshold is reached", () => {
  assert.deepEqual(
    applyCollisionResult({
      score: 5,
      hp: 4,
      targetWidth: 160,
      lastRecoveryWidth: 80,
      result: {
        scoreDelta: 2,
        hpDelta: 0,
        targetWidthDelta: 10,
        nextInvincibleTimer: 0,
      },
    }),
    {
      score: 7,
      hp: 5,
      targetWidth: 170,
      invincibleTimer: 0,
      lastRecoveryWidth: 170,
      healedHp: true,
    },
  );
});
