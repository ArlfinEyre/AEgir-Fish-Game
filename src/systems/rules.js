import {
  ENTITY_TYPES,
  PLAYER_INVINCIBILITY_FRAMES,
  SCORE_VALUES,
} from "../config.js";

export function getRandomFishVariant(variants, rng = Math.random) {
  const totalWeight = variants.reduce((sum, variant) => sum + variant.weight, 0);
  const target = rng() * totalWeight;

  let currentWeight = 0;
  for (const variant of variants) {
    currentWeight += variant.weight;
    if (target <= currentWeight) {
      return variant;
    }
  }

  return variants[0];
}

export function calculateGrowth(entityArea) {
  return Math.sqrt(entityArea) * 0.1;
}

export function resolveEntityCollision({
  entityType,
  playerArea,
  entityArea,
  playerInvincibleTimer,
}) {
  const canTakeDamage = playerInvincibleTimer <= 0;

  if (entityType === ENTITY_TYPES.FISH) {
    if (playerArea > entityArea) {
      return {
        removeEntity: true,
        scoreDelta: SCORE_VALUES.FISH,
        hpDelta: 0,
        targetWidthDelta: calculateGrowth(entityArea),
        nextInvincibleTimer: playerInvincibleTimer,
      };
    }

    return {
      removeEntity: false,
      scoreDelta: 0,
      hpDelta: canTakeDamage ? -1 : 0,
      targetWidthDelta: 0,
      nextInvincibleTimer: canTakeDamage
        ? PLAYER_INVINCIBILITY_FRAMES
        : playerInvincibleTimer,
    };
  }

  if (entityType === ENTITY_TYPES.REWARD) {
    return {
      removeEntity: true,
      scoreDelta: SCORE_VALUES.REWARD,
      hpDelta: 0,
      targetWidthDelta: 0,
      nextInvincibleTimer: playerInvincibleTimer,
    };
  }

  return {
    removeEntity: true,
    scoreDelta: SCORE_VALUES.PUNISH,
    hpDelta: canTakeDamage ? -1 : 0,
    targetWidthDelta: 0,
    nextInvincibleTimer: canTakeDamage
      ? PLAYER_INVINCIBILITY_FRAMES
      : playerInvincibleTimer,
  };
}
