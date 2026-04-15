import test from "node:test";
import assert from "node:assert/strict";

import { ENTITY_CATEGORIES } from "../src/config.js";
import { getSpawnCategories } from "../src/systems/spawn.js";

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
