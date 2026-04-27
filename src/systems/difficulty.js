import {
  ENTITY_CATEGORIES,
  FISH_HP_WEIGHT_RULES,
  INITIAL_HP,
  INITIAL_TIME_LEFT,
} from "../config.js";

const BASE_REFERENCE_MAX_SIZE = 300;
const RAMP_DURATION_MIN_SECONDS = 25;

function rampSeconds(factor) {
  return Math.max(
    RAMP_DURATION_MIN_SECONDS,
    Math.round(INITIAL_TIME_LEFT * factor),
  );
}

function clamp01(value) {
  return Math.max(0, Math.min(1, value));
}

function lerp(start, end, progress) {
  return start + (end - start) * progress;
}

function getCategoryProfile(difficulty, category) {
  return (
    difficulty.categoryProfiles[category] ??
    difficulty.categoryProfiles.default
  );
}

export const DIFFICULTY_PRESETS = {
  easy: {
    player: {
      initialHpMultiplier: 1.25,
      moveSpeedMultiplier: 1.06,
    },
    ramps: {
      spawnRateDurationSeconds: rampSeconds(1.1),
      entityGrowthDurationSeconds: rampSeconds(1.15),
      speedRampDurationSeconds: rampSeconds(1.08),
    },
    spawn: {
      minIntervalMultiplier: 0.58,
    },
    entity: {
      maxSizeGrowthMultiplier: 1.34,
      sizeBiasStartExponent: 1,
      sizeBiasEndExponent: 0.72,
      speedMultiplierStart: 0.95,
      speedMultiplierEnd: 1.12,
    },
    combat: {
      fishEatHealMultiplier: 1.12,
      fishEatMaxHpGainMultiplier: 1.1,
      fishFailDamageMultiplier: 0.88,
      punishFailDamageMultiplier: 0.9,
    },
    categoryProfiles: {
      default: { spawnIntervalMultiplier: 1, largeWeightBoost: 1, sizeGrowthMultiplier: 1, speedMultiplier: 1 },
      fish: { spawnIntervalMultiplier: 1, largeWeightBoost: 1.05, sizeGrowthMultiplier: 1, speedMultiplier: 1 },
      reward: { spawnIntervalMultiplier: 0.95, largeWeightBoost: 0.5, sizeGrowthMultiplier: 1, speedMultiplier: 1 },
      punish: { spawnIntervalMultiplier: 1.1, largeWeightBoost: 0.8, sizeGrowthMultiplier: 0.95, speedMultiplier: 0.95 },
      boss: { spawnIntervalMultiplier: 1, largeWeightBoost: 0.6, sizeGrowthMultiplier: 1, speedMultiplier: 1 },
    },
  },
  normal: {
    player: {
      initialHpMultiplier: 1,
      moveSpeedMultiplier: 1,
    },
    ramps: {
      spawnRateDurationSeconds: rampSeconds(0.95),
      entityGrowthDurationSeconds: rampSeconds(0.98),
      speedRampDurationSeconds: rampSeconds(0.96),
    },
    spawn: {
      minIntervalMultiplier: 0.36,
    },
    entity: {
      maxSizeGrowthMultiplier: 1.52,
      sizeBiasStartExponent: 1,
      sizeBiasEndExponent: 0.45,
      speedMultiplierStart: 1,
      speedMultiplierEnd: 1.25,
    },
    combat: {
      fishEatHealMultiplier: 1,
      fishEatMaxHpGainMultiplier: 1,
      fishFailDamageMultiplier: 1,
      punishFailDamageMultiplier: 1,
    },
    categoryProfiles: {
      default: { spawnIntervalMultiplier: 1, largeWeightBoost: 1, sizeGrowthMultiplier: 1, speedMultiplier: 1 },
      fish: { spawnIntervalMultiplier: 1, largeWeightBoost: 2.1, sizeGrowthMultiplier: 1, speedMultiplier: 1 },
      reward: { spawnIntervalMultiplier: 1, largeWeightBoost: 0.6, sizeGrowthMultiplier: 1, speedMultiplier: 1 },
      punish: { spawnIntervalMultiplier: 1, largeWeightBoost: 1.2, sizeGrowthMultiplier: 1.05, speedMultiplier: 1.06 },
      boss: { spawnIntervalMultiplier: 1, largeWeightBoost: 0.6, sizeGrowthMultiplier: 1.1, speedMultiplier: 1 },
    },
  },
  hard: {
    player: {
      initialHpMultiplier: 0.82,
      moveSpeedMultiplier: 0.96,
    },
    ramps: {
      spawnRateDurationSeconds: rampSeconds(0.74),
      entityGrowthDurationSeconds: rampSeconds(0.78),
      speedRampDurationSeconds: rampSeconds(0.76),
    },
    spawn: {
      minIntervalMultiplier: 0.28,
    },
    entity: {
      maxSizeGrowthMultiplier: 1.75,
      sizeBiasStartExponent: 1,
      sizeBiasEndExponent: 0.32,
      speedMultiplierStart: 1.08,
      speedMultiplierEnd: 1.45,
    },
    combat: {
      fishEatHealMultiplier: 0.88,
      fishEatMaxHpGainMultiplier: 0.85,
      fishFailDamageMultiplier: 1.18,
      punishFailDamageMultiplier: 1.28,
    },
    categoryProfiles: {
      default: { spawnIntervalMultiplier: 1, largeWeightBoost: 1, sizeGrowthMultiplier: 1, speedMultiplier: 1 },
      fish: { spawnIntervalMultiplier: 0.92, largeWeightBoost: 2.4, sizeGrowthMultiplier: 1.12, speedMultiplier: 1.08 },
      reward: { spawnIntervalMultiplier: 1.2, largeWeightBoost: 0.4, sizeGrowthMultiplier: 1, speedMultiplier: 1 },
      punish: { spawnIntervalMultiplier: 0.86, largeWeightBoost: 2, sizeGrowthMultiplier: 1.2, speedMultiplier: 1.2 },
      boss: { spawnIntervalMultiplier: 1, largeWeightBoost: 0.7, sizeGrowthMultiplier: 1.25, speedMultiplier: 1.08 },
    },
  },
};

export const DEFAULT_DIFFICULTY_PRESET = "normal";
export const DIFFICULTY_PRESET_IDS = Object.freeze(
  Object.keys(DIFFICULTY_PRESETS),
);

export function getDifficultyPreset(presetId = DEFAULT_DIFFICULTY_PRESET) {
  return DIFFICULTY_PRESETS[presetId] ?? DIFFICULTY_PRESETS[DEFAULT_DIFFICULTY_PRESET];
}

export function getInitialHpByDifficulty(difficulty) {
  return Math.max(1, Math.round(INITIAL_HP * difficulty.player.initialHpMultiplier));
}

export function getPlayerSpeedMultiplier(difficulty) {
  return difficulty.player.moveSpeedMultiplier;
}

export function getSpawnInterval(baseInterval, elapsedSeconds, difficulty, category) {
  const progress = clamp01(elapsedSeconds / difficulty.ramps.spawnRateDurationSeconds);
  const categoryMultiplier = getCategoryProfile(difficulty, category).spawnIntervalMultiplier;
  const rampedMultiplier = Math.max(
    difficulty.spawn.minIntervalMultiplier,
    1 - (1 - difficulty.spawn.minIntervalMultiplier) * progress,
  );
  return Math.max(1, baseInterval * categoryMultiplier * rampedMultiplier);
}

export function getEntitySizeByDifficulty(config, elapsedSeconds, difficulty, category, rng = Math.random) {
  const progress = clamp01(elapsedSeconds / difficulty.ramps.entityGrowthDurationSeconds);
  const categoryProfile = getCategoryProfile(difficulty, category);
  const dynamicMaxSize = lerp(
    config.maxSize,
    config.maxSize *
      difficulty.entity.maxSizeGrowthMultiplier *
      categoryProfile.sizeGrowthMultiplier,
    progress,
  );
  const biasExponent = lerp(
    difficulty.entity.sizeBiasStartExponent,
    difficulty.entity.sizeBiasEndExponent,
    progress,
  );
  const biasedRandom = Math.pow(rng(), biasExponent);
  return config.minSize + (dynamicMaxSize - config.minSize) * biasedRandom;
}

export function getVariantWeightByDifficulty(variant, elapsedSeconds, difficulty, category) {
  const progress = clamp01(elapsedSeconds / difficulty.ramps.entityGrowthDurationSeconds);
  const categoryProfile = getCategoryProfile(difficulty, category);
  const normalizedSize = clamp01(variant.maxSize / BASE_REFERENCE_MAX_SIZE);
  const growthBoost = 1 + normalizedSize * progress * categoryProfile.largeWeightBoost;
  return variant.weight * growthBoost;
}

export function getEntitySpeedMultiplier(elapsedSeconds, difficulty, category) {
  const progress = clamp01(elapsedSeconds / difficulty.ramps.speedRampDurationSeconds);
  const baseMultiplier = lerp(
    difficulty.entity.speedMultiplierStart,
    difficulty.entity.speedMultiplierEnd,
    progress,
  );
  return baseMultiplier * getCategoryProfile(difficulty, category).speedMultiplier;
}

export function getFishHpWeightByDifficulty(entityWidth, difficulty) {
  const tier =
    FISH_HP_WEIGHT_RULES.sizeTiers.find((entry) => entityWidth <= entry.maxWidth) ??
    FISH_HP_WEIGHT_RULES.sizeTiers[FISH_HP_WEIGHT_RULES.sizeTiers.length - 1];
  return {
    ...tier,
    eatHeal: Math.max(1, Math.round(tier.eatHeal * difficulty.combat.fishEatHealMultiplier)),
    eatMaxHpGain: Math.max(
      0,
      Math.round(tier.eatMaxHpGain * difficulty.combat.fishEatMaxHpGainMultiplier),
    ),
    failDamage: Math.max(
      1,
      Math.round(tier.failDamage * difficulty.combat.fishFailDamageMultiplier),
    ),
  };
}

export function getPunishDamageByDifficulty(difficulty) {
  return Math.max(
    1,
    Math.round(
      FISH_HP_WEIGHT_RULES.punishFailDamage *
        difficulty.combat.punishFailDamageMultiplier,
    ),
  );
}

export { ENTITY_CATEGORIES };
