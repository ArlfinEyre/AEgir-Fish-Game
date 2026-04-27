import {
  ENTITY_CATEGORIES,
  PLAYER_INVINCIBILITY_FRAMES,
} from "../config.js";
import {
  getDifficultyPreset,
  getFishHpWeightByDifficulty,
  getPunishDamageByDifficulty,
} from "./difficulty.js";

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
  return Math.sqrt(entityArea) * 0.04;
}

export function getFishHpWeightByWidth(entityWidth, difficulty = getDifficultyPreset()) {
  return getFishHpWeightByDifficulty(entityWidth, difficulty);
}

export function getCollisionOutcome({
  category,
  playerWidth,
  entityWidth,
  entityArea,
  entityScoreValue,
  playerInvincibleTimer,
  difficulty = getDifficultyPreset(),
}) {
  const canTakeDamage = playerInvincibleTimer <= 0;

  if (category === ENTITY_CATEGORIES.FISH) {
    const fishWeight = getFishHpWeightByWidth(entityWidth, difficulty);
    if (playerWidth * 1.2 >= entityWidth) {
      return {
        removeEntity: true,
        scoreDelta: entityScoreValue || 10,
        hpDelta: fishWeight.eatHeal,
        maxHpDelta: fishWeight.eatMaxHpGain,
        targetWidthDelta: calculateGrowth(entityArea),
        nextInvincibleTimer: playerInvincibleTimer,
        shouldGrow: true,
        shouldPlayInteract: true,
      };
    }

    return {
      removeEntity: false,
      scoreDelta: 0,
      hpDelta: canTakeDamage ? -fishWeight.failDamage : 0,
      maxHpDelta: 0,
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
      maxHpDelta: 0,
      targetWidthDelta: 0,
      nextInvincibleTimer: playerInvincibleTimer,
      shouldGrow: false,
      shouldPlayInteract: false,
    };
  }

  return {
    removeEntity: true,
    scoreDelta: entityScoreValue,
    hpDelta: canTakeDamage ? -getPunishDamageByDifficulty(difficulty) : 0,
    maxHpDelta: 0,
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
  maxHp,
  targetWidth,
  result,
}) {
  const nextMaxHp = Math.max(1, maxHp + (result.maxHpDelta || 0));
  const nextState = {
    score: score + result.scoreDelta,
    hp: Math.max(0, Math.min(hp + result.hpDelta, nextMaxHp)),
    maxHp: nextMaxHp,
    targetWidth: targetWidth + (result.targetWidthDelta || 0),
    invincibleTimer: result.nextInvincibleTimer,
    healedHp: (result.hpDelta || 0) > 0,
  };

  return nextState;
}
