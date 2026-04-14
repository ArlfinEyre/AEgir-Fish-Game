import {
  GAME_HEIGHT,
  GAME_WIDTH,
  PLAYER_START_WIDTH,
  PLAYER_SPEED,
} from "../config.js";

export class Player {
  constructor(assets) {
    this.assets = assets;
    this.x = GAME_WIDTH / 2;
    this.y = GAME_HEIGHT / 2;
    this.width = PLAYER_START_WIDTH;
    this.ratio = 1;

    if (assets.player.complete && assets.player.naturalWidth !== 0) {
      this.ratio = assets.player.naturalHeight / assets.player.naturalWidth;
    }

    this.height = this.width * this.ratio;
    this.targetWidth = this.width;
    this.speed = PLAYER_SPEED;
    this.invincibleTimer = 0;
  }

  update(keys) {
    if (keys.w || keys.arrowup) this.y -= this.speed;
    if (keys.s || keys.arrowdown) this.y += this.speed;
    if (keys.a || keys.arrowleft) this.x -= this.speed;
    if (keys.d || keys.arrowright) this.x += this.speed;

    this.x = Math.max(0, Math.min(GAME_WIDTH - this.width, this.x));
    this.y = Math.max(0, Math.min(GAME_HEIGHT - this.height, this.y));

    this.width += (this.targetWidth - this.width) * 0.05;
    this.height = this.width * this.ratio;

    if (this.invincibleTimer > 0) {
      this.invincibleTimer--;
    }
  }

  draw(ctx) {
    if (this.invincibleTimer > 0 && Math.floor(Date.now() / 100) % 2 === 0) {
      return;
    }

    if (this.assets.player.complete && this.assets.player.naturalWidth !== 0) {
      ctx.drawImage(this.assets.player, this.x, this.y, this.width, this.height);
      return;
    }

    ctx.fillStyle = "#4CAF50";
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }
}
