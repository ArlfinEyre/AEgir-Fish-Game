import {
  ENTITY_CATEGORIES,
  HP_RECOVERY_GROWTH_STEP,
  INITIAL_HP,
  PLAYER_INVINCIBILITY_FRAMES,
} from "../config.js";

export function randomBetween(min, max, rng = Math.random) {
  return rng() * (max - min) + min;
}

export function getRandomVariant(variants, rng = Math.random) {
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

export function shouldRecoverHp(targetWidth, lastRecoveryWidth) {
  return targetWidth - lastRecoveryWidth >= HP_RECOVERY_GROWTH_STEP;
}

export function getCollisionOutcome({
  category,
  playerWidth,
  entityWidth,
  entityArea,
  entityScoreValue,
  playerInvincibleTimer,
}) {
  const canTakeDamage = playerInvincibleTimer <= 0;

  if (category === ENTITY_CATEGORIES.FISH) {
    if (playerWidth * 1.2 >= entityWidth) {
      return {
        removeEntity: true,
        scoreDelta: entityScoreValue || 10,
        hpDelta: 0,
        targetWidthDelta: calculateGrowth(entityArea),
        nextInvincibleTimer: playerInvincibleTimer,
        shouldGrow: true,
        shouldPlayInteract: true,
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
      shouldGrow: false,
      shouldPlayInteract: canTakeDamage,
    };
  }

  if (category === ENTITY_CATEGORIES.REWARD) {
    return {
      removeEntity: true,
      scoreDelta: entityScoreValue,
      hpDelta: 0,
      targetWidthDelta: 0,
      nextInvincibleTimer: playerInvincibleTimer,
      shouldGrow: false,
      shouldPlayInteract: false,
    };
  }

  return {
    removeEntity: true,
    scoreDelta: entityScoreValue,
    hpDelta: canTakeDamage ? -1 : 0,
    targetWidthDelta: 0,
    nextInvincibleTimer: canTakeDamage
      ? PLAYER_INVINCIBILITY_FRAMES
      : playerInvincibleTimer,
    shouldGrow: false,
    shouldPlayInteract: canTakeDamage,
  };
}

export function applyCollisionResult({
  score,
  hp,
  targetWidth,
  lastRecoveryWidth,
  result,
}) {
  const nextState = {
    score: score + result.scoreDelta,
    hp: hp + result.hpDelta,
    targetWidth: targetWidth + (result.targetWidthDelta || 0),
    invincibleTimer: result.nextInvincibleTimer,
    lastRecoveryWidth,
    healedHp: false,
  };

  if (shouldRecoverHp(nextState.targetWidth, lastRecoveryWidth)) {
    nextState.hp = Math.min(nextState.hp + 1, INITIAL_HP);
    nextState.lastRecoveryWidth = nextState.targetWidth;
    nextState.healedHp = true;
  }

  return nextState;
}
