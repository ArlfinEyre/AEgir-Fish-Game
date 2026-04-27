import test from "node:test";
import assert from "node:assert/strict";

import { ENTITY_CATEGORIES, INITIAL_TIME_LEFT } from "../src/config.js";
import {
  getDifficultyPreset,
  getSpawnInterval,
} from "../src/systems/difficulty.js";
import { getSpawnCategories } from "../src/systems/spawn.js";

const normalDifficulty = getDifficultyPreset("normal");

test("getSpawnCategories spawns fish on the V2 cadence", () => {
  assert.deepEqual(getSpawnCategories(40, 1), [ENTITY_CATEGORIES.FISH]);
});

test("getSpawnCategories can spawn multiple categories on overlapping intervals", () => {
  assert.deepEqual(getSpawnCategories(47600, 1), [
    ENTITY_CATEGORIES.FISH,
    ENTITY_CATEGORIES.REWARD,
    ENTITY_CATEGORIES.PUNISH,
  ]);
});

test("getSpawnCategories accounts for ticker delta windows", () => {
  assert.deepEqual(getSpawnCategories(41, 2), [ENTITY_CATEGORIES.FISH]);
});

test("getSpawnCategories returns empty array when no spawn is due", () => {
  assert.deepEqual(getSpawnCategories(1, 1), []);
});

test("getDynamicSpawnInterval decreases as time progresses", () => {
  const earlyInterval = getSpawnInterval(100, 0, normalDifficulty, ENTITY_CATEGORIES.FISH);
  const lateInterval = getSpawnInterval(
    100,
    240,
    normalDifficulty,
    ENTITY_CATEGORIES.FISH,
  );

  assert.equal(earlyInterval, 100);
  assert.ok(lateInterval < earlyInterval);
});

test("fish spawn interval reaches dense floor by end of one match", () => {
  const base = 40;
  const atStart = getSpawnInterval(
    base,
    0,
    normalDifficulty,
    ENTITY_CATEGORIES.FISH,
  );
  const atMatchEnd = getSpawnInterval(
    base,
    INITIAL_TIME_LEFT,
    normalDifficulty,
    ENTITY_CATEGORIES.FISH,
  );

  assert.ok(atMatchEnd < atStart);
  assert.ok(atMatchEnd <= Math.ceil(base * normalDifficulty.spawn.minIntervalMultiplier) + 1);
});
