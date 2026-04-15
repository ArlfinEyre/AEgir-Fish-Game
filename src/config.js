export const GAME_WIDTH = 1920;
export const GAME_HEIGHT = 1080;
export const TARGET_FPS = 60;
export const FIXED_TIMESTEP_MS = 1000 / TARGET_FPS;
export const MAX_FRAME_TIME_MS = 250;
export const INITIAL_HP = 5;
export const INITIAL_SCORE = 0;
export const INITIAL_TIME_LEFT = 60;
export const PLAYER_INVINCIBILITY_FRAMES = 120;
export const HP_RECOVERY_GROWTH_STEP = 80;
export const LEADERBOARD_STORAGE_KEY = "fishGameScores";

export const ENTITY_CATEGORIES = {
  FISH: "fish",
  REWARD: "reward",
  PUNISH: "punish",
};

export const SPAWN_RULES = [
  { category: ENTITY_CATEGORIES.FISH, interval: 40 },
  { category: ENTITY_CATEGORIES.REWARD, interval: 850 },
  { category: ENTITY_CATEGORIES.PUNISH, interval: 700 },
];

export const GAME_CONFIG = {
  bgUrl: "assets/bg.jpg",
  scoreUIUrl: "assets/score_bg.png",
  player: {
    type: "spine",
    url: "assets/player/player.skel",
    baseSize: 80,
    speed: 4,
  },
  fishVariants: [
    {
      type: "spine",
      url: "assets/syjely/syjely.skel",
      minSize: 50,
      maxSize: 60,
      minSpeed: 1,
      maxSpeed: 3,
      weight: 40,
      scoreValue: 1,
    },
    {
      type: "spine",
      url: "assets/ghost/ghost.skel",
      minSize: 60,
      maxSize: 80,
      minSpeed: 2,
      maxSpeed: 3,
      weight: 25,
      scoreValue: 2,
    },
    {
      type: "spine",
      url: "assets/skadi/skadi.skel",
      minSize: 60,
      maxSize: 100,
      minSpeed: 2,
      maxSpeed: 3,
      weight: 20,
      scoreValue: 3,
    },
    {
      type: "spine",
      url: "assets/glady/glady.skel",
      minSize: 130,
      maxSize: 160,
      minSpeed: 4,
      maxSpeed: 6,
      weight: 20,
      scoreValue: 5,
    },
    {
      type: "spine",
      url: "assets/ulpia/ulpia.skel",
      minSize: 180,
      maxSize: 300,
      minSpeed: 1,
      maxSpeed: 2,
      weight: 5,
      scoreValue: 10,
    },
  ],
  rewardVariants: [
    {
      type: "image",
      url: "assets/rewards/special_reward.png",
      minSize: 80,
      maxSize: 80,
      minSpeed: 2,
      maxSpeed: 2,
      weight: 100,
      scoreValue: 20,
    },
  ],
  punishVariants: [
    {
      type: "spine",
      url: "assets/punishes/jellyboss/jellyboss.skel",
      minSize: 180,
      maxSize: 180,
      minSpeed: 1,
      maxSpeed: 1,
      weight: 40,
      scoreValue: 0,
    },
    {
      type: "spine",
      url: "assets/punishes/enemy_1152_dsurch_2/enemy_1152_dsurch_2.skel",
      minSize: 100,
      maxSize: 100,
      minSpeed: 1,
      maxSpeed: 1,
      weight: 60,
      scoreValue: -10,
    },
  ],
};
