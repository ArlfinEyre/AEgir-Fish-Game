import test from "node:test";
import assert from "node:assert/strict";

import {
  ENTITY_CATEGORIES,
  FISH_HP_WEIGHT_RULES,
  PLAYER_INVINCIBILITY_FRAMES,
} from "../src/config.js";
import {
  applyCollisionResult,
  calculateGrowth,
  getFishHpWeightByWidth,
  getCollisionOutcome,
  getRandomVariant,
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
  assert.equal(calculateGrowth(400), Math.sqrt(400) * 0.04);
  assert.ok(calculateGrowth(900) > calculateGrowth(400));
});

test("getFishHpWeightByWidth resolves size tiers", () => {
  assert.equal(getFishHpWeightByWidth(80).id, "small");
  assert.equal(getFishHpWeightByWidth(120).id, "medium");
  assert.equal(getFishHpWeightByWidth(400).id, "large");
});

test("getCollisionOutcome rewards eating an allowed fish", () => {
  const fishWeight = getFishHpWeightByWidth(80);
  assert.deepEqual(
    getCollisionOutcome({
      category: ENTITY_CATEGORIES.FISH,
      playerWidth: 100,
      entityWidth: 80,
      entityArea: 400,
      entityScoreValue: 3,
      playerInvincibleTimer: 0,
    }),
    {
      removeEntity: true,
      scoreDelta: 3,
      hpDelta: fishWeight.eatHeal,
      maxHpDelta: fishWeight.eatMaxHpGain,
      targetWidthDelta: calculateGrowth(400),
      nextInvincibleTimer: 0,
      shouldGrow: true,
      shouldPlayInteract: true,
    },
  );
});

test("getCollisionOutcome damages player on larger fish", () => {
  const fishWeight = getFishHpWeightByWidth(220);
  assert.deepEqual(
    getCollisionOutcome({
      category: ENTITY_CATEGORIES.FISH,
      playerWidth: 100,
      entityWidth: 220,
      entityArea: 400,
      entityScoreValue: 3,
      playerInvincibleTimer: 0,
    }),
    {
      removeEntity: false,
      scoreDelta: 0,
      hpDelta: -fishWeight.failDamage,
      maxHpDelta: 0,
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
      maxHpDelta: 0,
      targetWidthDelta: 0,
      nextInvincibleTimer: 10,
      shouldGrow: false,
      shouldPlayInteract: false,
    },
  );
});

test("applyCollisionResult clamps healed hp by new max hp", () => {
  assert.deepEqual(
    applyCollisionResult({
      score: 5,
      hp: 1007,
      maxHp: 1008,
      targetWidth: 160,
      result: {
        scoreDelta: 2,
        hpDelta: 15,
        maxHpDelta: 2,
        targetWidthDelta: 10,
        nextInvincibleTimer: 0,
      },
    }),
    {
      score: 7,
      hp: 1010,
      maxHp: 1010,
      targetWidth: 170,
      invincibleTimer: 0,
      healedHp: true,
    },
  );
});

test("applyCollisionResult does not increase max hp on failed eat", () => {
  const failDamage = FISH_HP_WEIGHT_RULES.sizeTiers[1].failDamage;
  assert.deepEqual(
    applyCollisionResult({
      score: 0,
      hp: 500,
      maxHp: 1000,
      targetWidth: 80,
      result: {
        scoreDelta: 0,
        hpDelta: -failDamage,
        maxHpDelta: 0,
        targetWidthDelta: 0,
        nextInvincibleTimer: PLAYER_INVINCIBILITY_FRAMES,
      },
    }),
    {
      score: 0,
      hp: 500 - failDamage,
      maxHp: 1000,
      targetWidth: 80,
      invincibleTimer: PLAYER_INVINCIBILITY_FRAMES,
      healedHp: false,
    },
  );
});
