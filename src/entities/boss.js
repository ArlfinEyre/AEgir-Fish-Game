import { GAME_HEIGHT, GAME_WIDTH, GAME_CONFIG } from "../config.js";
import { PIXI } from "../runtime/pixi.js";
import {
  getDifficultyPreset,
  getEntitySizeByDifficulty,
  getEntitySpeedMultiplier,
} from "../systems/difficulty.js";
import { getRandomVariant } from "../systems/rules.js";

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

export class Boss {
  constructor({
    createVisualObject,
    app,
    rng = Math.random,
    elapsedSeconds = 0,
    difficulty = getDifficultyPreset(),
    initialHp = 3000,
  }) {
    this.category = "boss";
    this.rng = rng;
    this.elapsedSeconds = elapsedSeconds;
    this.difficulty = difficulty;

    this.config = getRandomVariant(GAME_CONFIG.bossVariants, rng);
    this.spawnAtEdge(rng);

    this.view = createVisualObject(this.config);

    this.width = getEntitySizeByDifficulty(
      this.config,
      elapsedSeconds,
      difficulty,
      this.category,
      rng,
    );
    const speedMultiplier = getEntitySpeedMultiplier(
      elapsedSeconds,
      difficulty,
      this.category,
    );
    this.speed =
      ((this.config.minSpeed + this.config.maxSpeed) / 2) * speedMultiplier;

    const bounds = this.view.getLocalBounds();
    this.ratio = bounds.width > 0 ? bounds.height / bounds.width : 1;
    this.height = this.width * this.ratio;

    const scaleFactor = bounds.width > 0 ? this.width / bounds.width : 1;
    this.view.scale.set(scaleFactor);
    this.view.x = this.logicalX;
    this.view.y = this.logicalY;

    this.maxHp = initialHp;
    this.hp = initialHp;

    this.hpContainer = new PIXI.Container();
    this.hpBg = new PIXI.Graphics();
    this.hpFill = new PIXI.Graphics();

    this.hpBg.beginFill(0x111827);
    this.hpBg.drawRect(-80, 0, 160, 12);
    this.hpBg.endFill();
    this.hpContainer.addChild(this.hpBg);
    this.hpContainer.addChild(this.hpFill);

    app.stage.addChild(this.hpContainer);
    this.updateHpBar();
  }

  spawnAtEdge(rng) {
    if (rng() > 0.5) {
      this.logicalX = rng() > 0.5 ? -220 : GAME_WIDTH + 220;
      this.logicalY = rng() * GAME_HEIGHT;
      return;
    }

    this.logicalX = rng() * GAME_WIDTH;
    this.logicalY = rng() > 0.5 ? -220 : GAME_HEIGHT + 220;
  }

  update(player) {
    const dx = player.logicalX - this.logicalX;
    const dy = player.logicalY - this.logicalY;
    const distance = Math.hypot(dx, dy) || 1;
    const steerX = dx / distance;
    const steerY = dy / distance;

    this.logicalX = clamp(this.logicalX + steerX * this.speed, -240, GAME_WIDTH + 240);
    this.logicalY = clamp(this.logicalY + steerY * this.speed, -240, GAME_HEIGHT + 240);

    this.view.x = this.logicalX;
    this.view.y = this.logicalY;

    const verticalOffset = this.height / 2 - this.height * 0.35;
    this.hpContainer.position.set(this.logicalX, this.logicalY + verticalOffset);
    const uiScale = Math.max(1.2, this.width / 160);
    this.hpContainer.scale.set(uiScale);
  }

  applyDamage(amount) {
    this.hp = Math.max(0, this.hp - Math.max(0, amount));
    this.updateHpBar();
    return this.hp <= 0;
  }

  updateHpBar() {
    const hpPercentage = this.maxHp > 0 ? Math.max(0, this.hp / this.maxHp) : 0;
    const barColor = hpPercentage > 0.45 ? 0xef4444 : hpPercentage > 0.2 ? 0xf59e0b : 0x7f1d1d;

    this.hpFill.clear();
    this.hpFill.beginFill(barColor);
    this.hpFill.drawRect(-80, 0, 160 * hpPercentage, 12);
    this.hpFill.endFill();
  }

  isOffScreen() {
    return (
      this.logicalX < -360 ||
      this.logicalX > GAME_WIDTH + 360 ||
      this.logicalY < -360 ||
      this.logicalY > GAME_HEIGHT + 360
    );
  }

  destroy(removeView, app) {
    removeView(this.view);
    if (this.hpContainer) {
      app.stage.removeChild(this.hpContainer);
      this.hpContainer.destroy({ children: true });
    }
  }
}

