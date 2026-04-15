import { PIXI, Spine } from "../runtime/pixi.js";

export function createApplication({ width, height }) {
  const app = new PIXI.Application({
    width,
    height,
    backgroundColor: 0x0a4263,
    resolution: window.devicePixelRatio || 1,
  });

  app.view.style.position = "absolute";
  app.view.style.top = "0";
  app.view.style.left = "0";
  app.view.style.zIndex = "1";

  return app;
}

export function createBackground(texture, { width, height }) {
  const sprite = new PIXI.Sprite(texture);
  sprite.width = width;
  sprite.height = height;
  return sprite;
}

export function createScoreDisplay(app, scoreTexture) {
  const container = new PIXI.Container();
  const bg = new PIXI.Sprite(scoreTexture);
  bg.anchor.set(0.5);
  bg.x = 0;
  bg.y = 50;
  bg.width = 120;
  bg.height = 120;
  container.addChild(bg);

  const text = new PIXI.Text("0", {
    fill: 0xffffff,
    fontSize: 36,
    fontWeight: "bold",
  });
  text.anchor.set(0.5);
  text.x = 0;
  text.y = 110;
  container.addChild(text);

  container.position.set(1920 / 2, 80);
  app.stage.addChild(container);

  return text;
}

export function createVisualObjectFactory(app, resources) {
  return function createVisualObject(config) {
    const resource = resources[config.url];
    let view;

    if (config.type === "spine") {
      view = new Spine(resource.spineData);
      if (view.state.hasAnimation("Move")) {
        view.state.setAnimation(0, "Move", true);
      } else if (view.state.hasAnimation("Default")) {
        view.state.setAnimation(0, "Default", true);
      }
    } else {
      view = new PIXI.Sprite(resource);
      view.anchor.set(0.5);
    }

    app.stage.addChild(view);
    return view;
  };
}

export function createHpBackground() {
  const hpBg = new PIXI.Graphics();
  hpBg.beginFill(0x333333);
  hpBg.drawRect(-50, 0, 100, 10);
  hpBg.endFill();
  return hpBg;
}

export function createHpFill() {
  return new PIXI.Graphics();
}

export function createHpText(currentHp, maxHp) {
  const hpText = new PIXI.Text(`HP: ${currentHp}/${maxHp}`, {
    fill: 0xffffff,
    fontSize: 14,
    fontWeight: "bold",
  });
  hpText.anchor.set(0.5, 1);
  hpText.position.set(0, -2);
  return hpText;
}

export function removeView(view) {
  if (!view) {
    return;
  }

  if (view.parent) {
    view.parent.removeChild(view);
  }
  view.destroy();
}
