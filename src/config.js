export const GAME_WIDTH = 1920;
export const GAME_HEIGHT = 1080;
export const TARGET_FPS = 60;
export const FIXED_TIMESTEP_MS = 1000 / TARGET_FPS;
export const MAX_FRAME_TIME_MS = 250;
export const INITIAL_HP = 1000;
export const INITIAL_SCORE = 0;
export const INITIAL_TIME_LEFT = 60;
export const PLAYER_INVINCIBILITY_FRAMES = 120;
export const LEADERBOARD_STORAGE_KEY = "fishGameScores";
export const GAME_DIFFICULTY_PRESET = "normal";

/** Boss fight tuning (see game.js spawn + collision). */
export const BOSS_COMBAT = {
  initialHp: 3000,
  /** ~2.2% of INITIAL_HP per second while DoT active. */
  dotDamagePerSecond: Math.round(INITIAL_HP * 0.022),
  dotDurationSeconds: 3.5,
  /** Frames between player damage applications to the boss while overlapping (60 Hz steps). */
  damageToBossCooldownFrames: 12,
  /** playerWidth/bossWidth upper bounds for damageByTier entries. */
  ratioBreakpoints: [1, 1.5],
  damageByTier: [24, 72, 130],
  spawnWhenTimeLeftSeconds: 10,
};

export function getBossDamagePerHit(playerWidth, bossWidth) {
  const ratio = bossWidth > 0 ? playerWidth / bossWidth : 0;
  const { ratioBreakpoints, damageByTier } = BOSS_COMBAT;
  if (ratio < ratioBreakpoints[0]) {
    return damageByTier[0];
  }
  if (ratio < ratioBreakpoints[1]) {
    return damageByTier[1];
  }
  return damageByTier[2];
}

export const ENTITY_CATEGORIES = {
  FISH: "fish",
  REWARD: "reward",
  PUNISH: "punish",
  BOSS: "boss",
};

export const FISH_HP_WEIGHT_RULES = {
  sizeTiers: [
    {
      id: "small",
      maxWidth: 80,
      eatHeal: 0,
      eatMaxHpGain: 0,
      failDamage: 50,
    },
    {
      id: "medium",
      maxWidth: 150,
      eatHeal: 5,
      eatMaxHpGain: 2,
      failDamage: 100,
    },
    {
      id: "large",
      maxWidth: Number.POSITIVE_INFINITY,
      eatHeal: 20,
      eatMaxHpGain: 10,
      failDamage: 250,
    },
  ],
  punishFailDamage: 150,
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
      url: "assets/punishes/enemy_1152_dsurch_2/enemy_1152_dsurch_2.skel",
      minSize: 100,
      maxSize: 100,
      minSpeed: 1,
      maxSpeed: 1,
      weight: 60,
      scoreValue: -10,
    },
  ],
  bossVariants: [
    {
      type: "spine",
      url: "assets/punishes/jellyboss/jellyboss.skel",
      minSize: 180,
      maxSize: 180,
      minSpeed: 0.85,
      maxSpeed: 0.95,
      weight: 100,
      scoreValue: 0,
    },
  ],
};
