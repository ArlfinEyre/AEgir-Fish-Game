import {
  ENTITY_SPAWN_MARGIN,
  ENTITY_TYPES,
  GAME_HEIGHT,
  GAME_WIDTH,
} from "../config.js";
import { getRandomFishVariant } from "../systems/rules.js";

function randomBetween(min, max, rng) {
  return rng() * (max - min) + min;
}

export class Entity {
  constructor(type, assets, rng = Math.random) {
    this.type = type;
    this.rng = rng;

    if (rng() > 0.5) {
      this.x = rng() > 0.5 ? -ENTITY_SPAWN_MARGIN : GAME_WIDTH + ENTITY_SPAWN_MARGIN;
      this.y = rng() * GAME_HEIGHT;
    } else {
      this.x = rng() * GAME_WIDTH;
      this.y = rng() > 0.5 ? -ENTITY_SPAWN_MARGIN : GAME_HEIGHT + ENTITY_SPAWN_MARGIN;
    }

    if (type === ENTITY_TYPES.FISH) {
      const variant = getRandomFishVariant(assets.fishVariants, rng);
      const randomWidth = randomBetween(variant.minSize, variant.maxSize, rng);

      this.img = variant.img;
      this.speed = randomBetween(variant.minSpeed, variant.maxSpeed, rng);

      if (this.img.complete && this.img.naturalWidth !== 0) {
        const ratio = this.img.naturalHeight / this.img.naturalWidth;
        this.width = randomWidth;
        this.height = randomWidth * ratio;
      } else {
        this.width = randomWidth;
        this.height = randomWidth;
      }
    } else if (type === ENTITY_TYPES.REWARD) {
      this.img = assets.reward;
      this.width = 80;
      this.height = 80;
      this.speed = 2;
    } else {
      this.img = assets.punish;
      this.width = 80;
      this.height = 80;
      this.speed = 2;
    }

    const targetX = GAME_WIDTH / 2 - 200 + rng() * 400;
    const targetY = GAME_HEIGHT / 2 - 200 + rng() * 400;
    const angle = Math.atan2(targetY - this.y, targetX - this.x);

    this.vx = Math.cos(angle) * this.speed;
    this.vy = Math.sin(angle) * this.speed;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
  }

  draw(ctx) {
    const color =
      this.type === ENTITY_TYPES.FISH
        ? "#F44336"
        : this.type === ENTITY_TYPES.REWARD
          ? "#FFEB3B"
          : "#9C27B0";

    if (this.img.complete && this.img.naturalWidth !== 0) {
      ctx.drawImage(this.img, this.x, this.y, this.width, this.height);
      return;
    }

    ctx.fillStyle = color;
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }

  isOffScreen() {
    return (
      this.x < -ENTITY_SPAWN_MARGIN ||
      this.x > GAME_WIDTH + ENTITY_SPAWN_MARGIN ||
      this.y < -ENTITY_SPAWN_MARGIN ||
      this.y > GAME_HEIGHT + ENTITY_SPAWN_MARGIN
    );
  }
}
