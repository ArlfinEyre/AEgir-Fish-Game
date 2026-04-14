export const GAME_WIDTH = 1920;
export const GAME_HEIGHT = 1080;
export const INITIAL_HP = 5;
export const INITIAL_SCORE = 0;
export const PLAYER_START_WIDTH = 100;
export const PLAYER_SPEED = 6;
export const PLAYER_INVINCIBILITY_FRAMES = 120;
export const ENTITY_SPAWN_MARGIN = 200;

export const ENTITY_TYPES = {
  FISH: "fish",
  REWARD: "reward",
  PUNISH: "punish",
};

export const SCORE_VALUES = {
  FISH: 10,
  REWARD: 50,
  PUNISH: -30,
};

export const FISH_VARIANTS = [
  {
    url: "assets/jellyfish.png",
    minSize: 30,
    maxSize: 60,
    minSpeed: 2,
    maxSpeed: 4,
    weight: 40,
  },
  {
    url: "assets/fish_specter.png",
    minSize: 40,
    maxSize: 80,
    minSpeed: 3,
    maxSpeed: 5,
    weight: 25,
  },
  {
    url: "assets/fish_skadi.png",
    minSize: 50,
    maxSize: 100,
    minSpeed: 3,
    maxSpeed: 5,
    weight: 20,
  },
  {
    url: "assets/fish_gld.png",
    minSize: 70,
    maxSize: 130,
    minSpeed: 4,
    maxSpeed: 7,
    weight: 10,
  },
  {
    url: "assets/fish_ulp.png",
    minSize: 180,
    maxSize: 300,
    minSpeed: 1,
    maxSpeed: 2,
    weight: 5,
  },
];
