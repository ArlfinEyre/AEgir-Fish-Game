import { FISH_VARIANTS } from "./config.js";

function createImage(src) {
  const image = new Image();
  image.src = src;
  return image;
}

export function createAssets() {
  const fishVariants = FISH_VARIANTS.map((variant) => ({
    ...variant,
    img: createImage(variant.url),
  }));

  return {
    bg: createImage("assets/bg.jpg"),
    player: createImage("assets/player.png"),
    reward: createImage("assets/special_reward.png"),
    punish: createImage("assets/special_punish.png"),
    fishVariants,
  };
}
