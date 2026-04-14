import test from "node:test";
import assert from "node:assert/strict";

import { ENTITY_TYPES } from "../src/config.js";
import { getSpawnTypes } from "../src/systems/spawn.js";

test("getSpawnTypes spawns fish every 50 frames", () => {
  assert.deepEqual(getSpawnTypes(50), [ENTITY_TYPES.FISH]);
});

test("getSpawnTypes can spawn multiple special entities on shared intervals", () => {
  assert.deepEqual(getSpawnTypes(7200), [
    ENTITY_TYPES.FISH,
    ENTITY_TYPES.REWARD,
    ENTITY_TYPES.PUNISH,
  ]);
});

test("getSpawnTypes returns empty array when no spawn is due", () => {
  assert.deepEqual(getSpawnTypes(1), []);
});
