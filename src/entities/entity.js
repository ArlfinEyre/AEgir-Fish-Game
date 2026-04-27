import {
  ENTITY_CATEGORIES,
  GAME_HEIGHT,
  GAME_WIDTH,
  GAME_CONFIG,
} from "../config.js";
import { getRandomVariant, randomBetween } from "../systems/rules.js";
import {
  getDifficultyPreset,
  getEntitySizeByDifficulty,
  getEntitySpeedMultiplier,
  getVariantWeightByDifficulty,
} from "../systems/difficulty.js";

export function getProgressiveVariant(
  variants,
  elapsedSeconds,
  difficulty,
  category,
  rng = Math.random,
) {
  if (!variants.length) {
    return undefined;
  }

  const weightedVariants = variants.map((variant) => ({
    ...variant,
    weight: getVariantWeightByDifficulty(
      variant,
      elapsedSeconds,
      difficulty,
      category,
    ),
  }));

  return getRandomVariant(weightedVariants, rng);
}

export class Entity {
  constructor(
    category,
    createVisualObject,
    rng = Math.random,
    elapsedSeconds = 0,
    difficulty = getDifficultyPreset(),
  ) {
    this.category = category;
    this.rng = rng;
    this.elapsedSeconds = elapsedSeconds;
    this.difficulty = difficulty;

    this.config = this.getVariantConfig(category, rng, elapsedSeconds, difficulty);
    this.spawnAtEdge(rng);

    this.view = createVisualObject(this.config);

    const randomLogicalWidth = getEntitySizeByDifficulty(
      this.config,
      elapsedSeconds,
      difficulty,
      category,
      rng,
    );

    const speedMultiplier = getEntitySpeedMultiplier(
      elapsedSeconds,
      difficulty,
      category,
    );
    this.speed =
      randomBetween(this.config.minSpeed, this.config.maxSpeed, rng) *
      speedMultiplier;
    this.width = randomLogicalWidth;

    const bounds = this.view.getLocalBounds();
    this.ratio = bounds.width > 0 ? bounds.height / bounds.width : 1;
    this.height = this.width * this.ratio;

    const scaleFactor = bounds.width > 0 ? this.width / bounds.width : 1;
    const targetX = GAME_WIDTH / 2 - 200 + rng() * 400;
    const targetY = GAME_HEIGHT / 2 - 200 + rng() * 400;
    const angle = Math.atan2(targetY - this.logicalY, targetX - this.logicalX);

    this.vx = Math.cos(angle) * this.speed;
    this.vy = Math.sin(angle) * this.speed;

    const flipX = this.vx < 0 ? -1 : 1;
    this.view.scale.set(scaleFactor * flipX, scaleFactor);
    this.view.x = this.logicalX;
    this.view.y = this.logicalY;
  }

  getVariantConfig(category, rng, elapsedSeconds, difficulty) {
    if (category === ENTITY_CATEGORIES.FISH) {
      return getProgressiveVariant(
        GAME_CONFIG.fishVariants,
        elapsedSeconds,
        difficulty,
        category,
        rng,
      );
    }

    if (category === ENTITY_CATEGORIES.REWARD) {
      return getProgressiveVariant(
        GAME_CONFIG.rewardVariants,
        elapsedSeconds,
        difficulty,
        category,
        rng,
      );
    }

    if (category === ENTITY_CATEGORIES.BOSS) {
      return getProgressiveVariant(
        GAME_CONFIG.bossVariants,
        elapsedSeconds,
        difficulty,
        category,
        rng,
      );
    }

    return getProgressiveVariant(
      GAME_CONFIG.punishVariants,
      elapsedSeconds,
      difficulty,
      category,
      rng,
    );
  }

  spawnAtEdge(rng) {
    if (rng() > 0.5) {
      this.logicalX = rng() > 0.5 ? -200 : 2120;
      this.logicalY = rng() * GAME_HEIGHT;
      return;
    }

    this.logicalX = rng() * GAME_WIDTH;
    this.logicalY = rng() > 0.5 ? -200 : 1280;
  }

  update() {
    this.logicalX += this.vx;
    this.logicalY += this.vy;
    this.view.x = this.logicalX;
    this.view.y = this.logicalY;
  }

  isOffScreen() {
    return (
      this.logicalX < -300 ||
      this.logicalX > 2220 ||
      this.logicalY < -300 ||
      this.logicalY > 1380
    );
  }

  destroy(removeView) {
    removeView(this.view);
  }
}
