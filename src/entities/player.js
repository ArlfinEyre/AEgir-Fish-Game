import {
  GAME_HEIGHT,
  GAME_WIDTH,
  GAME_CONFIG,
  INITIAL_HP,
} from "../config.js";

export class Player {
  constructor({ createVisualObject, app, hpTextFactory, hpFillFactory, hpBgFactory }) {
    this.logicalX = GAME_WIDTH / 2;
    this.logicalY = GAME_HEIGHT / 2;

    this.view = createVisualObject(GAME_CONFIG.player);
    this.view.x = this.logicalX;
    this.view.y = this.logicalY;

    this.width = GAME_CONFIG.player.baseSize;
    this.targetWidth = this.width;
    this.lastRecoveryWidth = this.width;

    this.ratio = 1;
    const bounds = this.view.getLocalBounds();
    if (bounds.width > 0) {
      this.ratio = bounds.height / bounds.width;
    }
    this.height = this.width * this.ratio;

    this.speed = GAME_CONFIG.player.speed;
    this.invincibleTimer = 0;
    this.maxHp = INITIAL_HP;

    this.hpContainer = new PIXI.Container();
    this.hpBg = hpBgFactory();
    this.hpFill = hpFillFactory();
    this.hpText = hpTextFactory(INITIAL_HP, this.maxHp);

    this.hpContainer.addChild(this.hpBg);
    this.hpContainer.addChild(this.hpFill);
    this.hpContainer.addChild(this.hpText);
    app.stage.addChild(this.hpContainer);
  }

  update(keys, hp) {
    if (keys.w || keys.arrowup) this.logicalY -= this.speed;
    if (keys.s || keys.arrowdown) this.logicalY += this.speed;
    if (keys.a || keys.arrowleft) this.logicalX -= this.speed;
    if (keys.d || keys.arrowright) this.logicalX += this.speed;

    this.logicalX = Math.max(0, Math.min(GAME_WIDTH, this.logicalX));
    this.logicalY = Math.max(0, Math.min(GAME_HEIGHT, this.logicalY));

    this.width += (this.targetWidth - this.width) * 0.002;
    this.height = this.width * this.ratio;

    this.view.x = this.logicalX;
    this.view.y = this.logicalY;

    const scaleFactor = this.view.getLocalBounds().width > 0
      ? this.width / this.view.getLocalBounds().width
      : 1;
    const flipX =
      keys.a || keys.arrowleft
        ? -1
        : keys.d || keys.arrowright
          ? 1
          : Math.sign(this.view.scale.x) || 1;

    this.view.scale.set(scaleFactor * flipX, scaleFactor);

    if (this.invincibleTimer > 0) {
      this.invincibleTimer--;
      this.view.alpha = Math.floor(Date.now() / 100) % 2 === 0 ? 0.3 : 1;
    } else {
      this.view.alpha = 1;
    }

    const verticalOffset = this.height / 2 - this.height * 0.3;
    this.hpContainer.position.set(this.logicalX, this.logicalY + verticalOffset);

    const uiScale = Math.max(1, this.width / 100);
    this.hpContainer.scale.set(uiScale);
    this.hpText.text = `HP: ${hp}/${this.maxHp}`;
  }

  flashHealText() {
    if (!this.hpText?.style) {
      return;
    }

    this.hpText.style.fill = 0x00ff00;
    window.setTimeout(() => {
      if (this.hpText?.style) {
        this.hpText.style.fill = 0xffffff;
      }
    }, 500);
  }

  playInteractAnimation() {
    if (
      this.view instanceof PIXI.spine.Spine &&
      this.view.state.hasAnimation("Interact")
    ) {
      this.view.state.setAnimation(0, "Interact", false);
      this.view.state.addAnimation(0, "Move", true, 0);
    }
  }

  updateHpBar(hp) {
    const hpPercentage = Math.max(0, hp / this.maxHp);
    const barColor =
      hpPercentage > 0.4 ? 0x00ff00 : hpPercentage > 0.2 ? 0xffff00 : 0xff0000;

    this.hpFill.clear();
    this.hpFill.beginFill(barColor);
    this.hpFill.drawRect(-50, 0, 100 * hpPercentage, 10);
    this.hpFill.endFill();
  }

  destroy(removeView, app) {
    removeView(this.view);

    if (this.hpContainer) {
      app.stage.removeChild(this.hpContainer);
      this.hpContainer.destroy({ children: true });
    }
  }
}
