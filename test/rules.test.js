import test from "node:test";
import assert from "node:assert/strict";

import { ENTITY_TYPES, PLAYER_INVINCIBILITY_FRAMES } from "../src/config.js";
import {
  calculateGrowth,
  getRandomFishVariant,
  resolveEntityCollision,
} from "../src/systems/rules.js";

test("getRandomFishVariant respects weight ordering", () => {
  const variants = [
    { id: "a", weight: 10 },
    { id: "b", weight: 20 },
  ];

  assert.equal(getRandomFishVariant(variants, () => 0).id, "a");
  assert.equal(getRandomFishVariant(variants, () => 0.99).id, "b");
});

test("calculateGrowth grows with eaten area", () => {
  assert.equal(calculateGrowth(400), 2);
});

test("resolveEntityCollision rewards eating a smaller fish", () => {
  assert.deepEqual(
    resolveEntityCollision({
      entityType: ENTITY_TYPES.FISH,
      playerArea: 1000,
      entityArea: 400,
      playerInvincibleTimer: 0,
    }),
    {
      removeEntity: true,
      scoreDelta: 10,
      hpDelta: 0,
      targetWidthDelta: 2,
      nextInvincibleTimer: 0,
    },
  );
});

test("resolveEntityCollision damages player on larger fish", () => {
  assert.deepEqual(
    resolveEntityCollision({
      entityType: ENTITY_TYPES.FISH,
      playerArea: 100,
      entityArea: 400,
      playerInvincibleTimer: 0,
    }),
    {
      removeEntity: false,
      scoreDelta: 0,
      hpDelta: -1,
      targetWidthDelta: 0,
      nextInvincibleTimer: PLAYER_INVINCIBILITY_FRAMES,
    },
  );
});

test("resolveEntityCollision keeps invincible player from taking extra damage", () => {
  assert.deepEqual(
    resolveEntityCollision({
      entityType: ENTITY_TYPES.PUNISH,
      playerArea: 100,
      entityArea: 400,
      playerInvincibleTimer: 10,
    }),
    {
      removeEntity: true,
      scoreDelta: -30,
      hpDelta: 0,
      targetWidthDelta: 0,
      nextInvincibleTimer: 10,
    },
  );
});
