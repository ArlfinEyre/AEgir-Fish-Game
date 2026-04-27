import test from "node:test";
import assert from "node:assert/strict";

import {
  getProgressiveVariant,
} from "../src/entities/entity.js";
import { INITIAL_TIME_LEFT } from "../src/config.js";
import {
  ENTITY_CATEGORIES,
  getDifficultyPreset,
  getEntitySizeByDifficulty,
  getVariantWeightByDifficulty,
} from "../src/systems/difficulty.js";

const normalDifficulty = getDifficultyPreset("normal");

test("getVariantWeightMultiplier boosts large variants over time", () => {
  const smallVariant = { maxSize: 80, weight: 1 };
  const largeVariant = { maxSize: 300, weight: 1 };
  const earlySmall = getVariantWeightByDifficulty(
    smallVariant,
    0,
    normalDifficulty,
    ENTITY_CATEGORIES.FISH,
  );
  const lateSmall = getVariantWeightByDifficulty(
    smallVariant,
    180,
    normalDifficulty,
    ENTITY_CATEGORIES.FISH,
  );
  const lateLarge = getVariantWeightByDifficulty(
    largeVariant,
    180,
    normalDifficulty,
    ENTITY_CATEGORIES.FISH,
  );

  assert.equal(earlySmall, 1);
  assert.ok(lateSmall > earlySmall);
  assert.ok(lateLarge > lateSmall);
});

test("getProgressiveVariant favors larger fish later", () => {
  const variants = [
    { id: "small", maxSize: 80, weight: 1 },
    { id: "large", maxSize: 300, weight: 1 },
  ];

  const early = getProgressiveVariant(
    variants,
    0,
    normalDifficulty,
    ENTITY_CATEGORIES.FISH,
    () => 0.4,
  );
  const late = getProgressiveVariant(
    variants,
    180,
    normalDifficulty,
    ENTITY_CATEGORIES.FISH,
    () => 0.4,
  );

  assert.equal(early.id, "small");
  assert.equal(late.id, "large");
});

test("getEntitySizeByDifficulty increases upper range over time", () => {
  const config = { minSize: 60, maxSize: 100 };
  const earlySize = getEntitySizeByDifficulty(
    config,
    0,
    normalDifficulty,
    ENTITY_CATEGORIES.FISH,
    () => 1,
  );
  const lateSize = getEntitySizeByDifficulty(
    config,
    180,
    normalDifficulty,
    ENTITY_CATEGORIES.FISH,
    () => 1,
  );

  assert.equal(earlySize, 100);
  assert.ok(lateSize > earlySize);
});

test("entity max size growth is visible within one match duration", () => {
  const config = { minSize: 60, maxSize: 100 };
  const earlySize = getEntitySizeByDifficulty(
    config,
    0,
    normalDifficulty,
    ENTITY_CATEGORIES.FISH,
    () => 1,
  );
  const atMatchEnd = getEntitySizeByDifficulty(
    config,
    INITIAL_TIME_LEFT,
    normalDifficulty,
    ENTITY_CATEGORIES.FISH,
    () => 1,
  );

  assert.ok(atMatchEnd > earlySize);
});
