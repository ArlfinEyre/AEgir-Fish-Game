import { loadGameAssets, updateLoadingText } from "./assets.js";
import {
  BOSS_COMBAT,
  FIXED_TIMESTEP_MS,
  GAME_DIFFICULTY_PRESET,
  GAME_CONFIG,
  GAME_HEIGHT,
  GAME_WIDTH,
  INITIAL_SCORE,
  INITIAL_TIME_LEFT,
  MAX_FRAME_TIME_MS,
  getBossDamagePerHit,
} from "./config.js";
import { Entity } from "./entities/entity.js";
import { Boss } from "./entities/boss.js";
import { Player } from "./entities/player.js";
import { checkCollision } from "./systems/collision.js";
import { saveScore } from "./systems/leaderboard.js";
import {
  applyCollisionResult,
  getCollisionOutcome,
} from "./systems/rules.js";
import { getSpawnCategories } from "./systems/spawn.js";
import {
  DIFFICULTY_PRESET_IDS,
  getDifficultyPreset,
  getInitialHpByDifficulty,
  getPlayerSpeedMultiplier,
} from "./systems/difficulty.js";
import {
  createApplication,
  createBackground,
  createHpBackground,
  createHpFill,
  createHpText,
  createScoreDisplay,
  createVisualObjectFactory,
  removeView,
} from "./systems/view.js";

const gameWrapper = document.getElementById("game-wrapper");
const hud = document.getElementById("hud");
const timeDisplay = document.getElementById("time-display");
const gameOverScreen = document.getElementById("game-over-screen");
const finalScoreDisplay = document.getElementById("final-score");
const leaderboardList = document.getElementById("leaderboard-list");
const restartButton = document.getElementById("restart-button");
const loadingScreen = document.getElementById("loading-screen");
const loadingText = document.getElementById("loading-text");
const exitMenuBtn = document.getElementById("exit-menu-btn");
const exitConfirmOverlay = document.getElementById("exit-confirm-overlay");
const exitConfirmText = document.getElementById("exit-confirm-text");
const exitConfirmYes = document.getElementById("exit-confirm-yes");
const exitConfirmCancel = document.getElementById("exit-confirm-cancel");
const urlParams = new URLSearchParams(window.location.search);

function resolveDifficultyPresetId() {
  const requestedPreset = urlParams.get("difficulty");
  if (requestedPreset && DIFFICULTY_PRESET_IDS.includes(requestedPreset)) {
    return requestedPreset;
  }
  return GAME_DIFFICULTY_PRESET;
}

/** 预览模式仅允许 `?mode=demo&preview=1`（由主页二次确认后进入）。 */
function resolveStartMode() {
  const requestedMode = urlParams.get("mode");
  const preview = urlParams.get("preview") === "1";
  if (preview && requestedMode === "demo") {
    return "demo";
  }
  return "play";
}

function hubUrl() {
  return new URL("index.html", window.location.href).href;
}

function showExitConfirm() {
  if (!exitConfirmOverlay || !exitConfirmText) {
    return;
  }
  const midGame = state.mode === "play" && !state.isGameOver;
  exitConfirmText.textContent = midGame
    ? "返回主菜单？当前对局进度将不会保存。"
    : "确定返回小游戏合集主页？";
  exitConfirmOverlay.classList.add("is-open");
}

function hideExitConfirm() {
  exitConfirmOverlay?.classList.remove("is-open");
}

function goToHub() {
  window.location.assign(hubUrl());
}

exitMenuBtn?.addEventListener("click", () => {
  showExitConfirm();
});

exitConfirmCancel?.addEventListener("click", () => {
  hideExitConfirm();
});

exitConfirmYes?.addEventListener("click", () => {
  goToHub();
});

const app = createApplication({ width: GAME_WIDTH, height: GAME_HEIGHT });
gameWrapper.appendChild(app.view);

const keys = {};
const demoKeys = {
  w: false,
  a: false,
  s: false,
  d: false,
  arrowup: false,
  arrowleft: false,
  arrowdown: false,
  arrowright: false,
};
let loadedResources = {};
let createVisualObject;
let player;
let scoreDisplay;
let accumulatedTimeMs = 0;
let demoRestartTimeoutId = null;
const selectedDifficultyPreset = resolveDifficultyPresetId();
const initialMode = resolveStartMode();
const lockedEntryMode = initialMode;
const activeDifficulty = getDifficultyPreset(selectedDifficultyPreset);
const initialHp = getInitialHpByDifficulty(activeDifficulty);

const state = {
  isGameOver: true,
  mode: "demo",
  score: INITIAL_SCORE,
  hp: initialHp,
  maxHp: initialHp,
  entities: [],
  boss: null,
  bossSpawned: false,
  bossDotSecondsLeft: 0,
  bossDotDamagePerSecond: BOSS_COMBAT.dotDamagePerSecond,
  bossDotTickAccumulator: 0,
  bossDamageToBossCooldownFrames: 0,
  spawnTimer: 0,
  elapsedSeconds: 0,
  timeLeft: INITIAL_TIME_LEFT,
  demoTargetX: GAME_WIDTH / 2,
  demoTargetY: GAME_HEIGHT / 2,
  demoDecisionTimer: 0,
};

window.addEventListener("keydown", (event) => {
  if (event.code === "Escape") {
    event.preventDefault();
    if (exitConfirmOverlay?.classList.contains("is-open")) {
      hideExitConfirm();
      return;
    }
    showExitConfirm();
    return;
  }

  const loweredKey = event.key.toLowerCase();
  keys[loweredKey] = true;
});

window.addEventListener("keyup", (event) => {
  keys[event.key.toLowerCase()] = false;
});

restartButton.addEventListener("click", () => startGame(lockedEntryMode));

function renderLeaderboard(scores) {
  leaderboardList.innerHTML = "";
  scores.forEach((score, index) => {
    leaderboardList.innerHTML += `<li>第 ${index + 1} 名: ${score} 分</li>`;
  });
}

function resetState() {
  state.score = INITIAL_SCORE;
  state.hp = initialHp;
  state.maxHp = initialHp;
  state.spawnTimer = 0;
  state.elapsedSeconds = 0;
  state.bossSpawned = false;
  state.bossDotSecondsLeft = 0;
  state.bossDotTickAccumulator = 0;
  state.bossDotDamagePerSecond = BOSS_COMBAT.dotDamagePerSecond;
  state.bossDamageToBossCooldownFrames = 0;
  destroyBoss();
  state.timeLeft = INITIAL_TIME_LEFT;
  state.isGameOver = false;
  accumulatedTimeMs = 0;
  timeDisplay.innerText = String(INITIAL_TIME_LEFT);
}

function clearPlayerInput() {
  Object.keys(keys).forEach((key) => {
    keys[key] = false;
  });
}

function clearDemoInput() {
  Object.keys(demoKeys).forEach((key) => {
    demoKeys[key] = false;
  });
}

function destroyEntities() {
  state.entities.forEach((entity) => entity.destroy(removeView));
  state.entities = [];
}

function destroyBoss() {
  if (state.boss) {
    state.boss.destroy(removeView, app);
    state.boss = null;
  }
}

function createPlayer() {
  player = new Player({
    createVisualObject,
    app,
    initialHp: initialHp,
    speedMultiplier: getPlayerSpeedMultiplier(activeDifficulty),
    hpBgFactory: createHpBackground,
    hpFillFactory: createHpFill,
    hpTextFactory: createHpText,
  });
}

function scheduleDemoRestart(delayMs) {
  if (demoRestartTimeoutId) {
    window.clearTimeout(demoRestartTimeoutId);
  }

  demoRestartTimeoutId = window.setTimeout(() => {
    demoRestartTimeoutId = null;
    startGame("demo");
  }, delayMs);
}

function startGame(mode = "play") {
  if (demoRestartTimeoutId) {
    window.clearTimeout(demoRestartTimeoutId);
    demoRestartTimeoutId = null;
  }

  state.mode = mode;
  gameOverScreen.style.display = "none";
  hud.style.display = mode === "demo" ? "none" : "block";

  if (scoreDisplay?.parent) {
    scoreDisplay.parent.visible = mode !== "demo";
  }

  if (player) {
    player.destroy(removeView, app);
  }

  destroyEntities();
  destroyBoss();
  createPlayer();
  resetState();
  clearPlayerInput();
  clearDemoInput();
  state.demoDecisionTimer = 0;
  state.demoTargetX = GAME_WIDTH / 2;
  state.demoTargetY = GAME_HEIGHT / 2;
}

function endGame() {
  state.isGameOver = true;
  destroyBoss();

  if (state.mode === "demo") {
    scheduleDemoRestart(1200);
    return;
  }

  gameOverScreen.style.display = "flex";
  finalScoreDisplay.innerText = state.score;
  renderLeaderboard(saveScore(state.score));
}

function updateTime(delta) {
  if (state.mode === "demo") {
    return true;
  }

  const deltaSeconds = delta / 60;
  state.timeLeft -= deltaSeconds;

  if (state.timeLeft <= 0) {
    state.timeLeft = 0;
    timeDisplay.innerText = "0";
    endGame();
    return false;
  }

  timeDisplay.innerText = String(Math.ceil(state.timeLeft));
  return true;
}

function applyBossDot(delta) {
  if (state.bossDotSecondsLeft <= 0) {
    state.bossDotTickAccumulator = 0;
    return;
  }

  const deltaSeconds = delta / 60;
  state.bossDotSecondsLeft = Math.max(0, state.bossDotSecondsLeft - deltaSeconds);
  state.bossDotTickAccumulator += deltaSeconds;

  while (state.bossDotTickAccumulator >= 1) {
    state.bossDotTickAccumulator -= 1;
    state.hp = Math.max(0, state.hp - state.bossDotDamagePerSecond);
    if (state.hp <= 0) {
      endGame();
      return;
    }
  }
}

function spawnEntities(delta) {
  state.spawnTimer += delta;
  state.elapsedSeconds += delta / 60;

  getSpawnCategories(
    state.spawnTimer,
    delta,
    state.elapsedSeconds,
    activeDifficulty,
  ).forEach((category) => {
    state.entities.push(
      new Entity(
        category,
        createVisualObject,
        Math.random,
        state.elapsedSeconds,
        activeDifficulty,
      ),
    );
  });
}

function spawnBossIfNeeded() {
  if (state.bossSpawned || state.mode === "demo" || state.isGameOver) {
    return;
  }

  if (
    state.timeLeft > 0 &&
    state.timeLeft <= BOSS_COMBAT.spawnWhenTimeLeftSeconds
  ) {
    state.bossSpawned = true;
    state.boss = new Boss({
      createVisualObject,
      app,
      rng: Math.random,
      elapsedSeconds: state.elapsedSeconds,
      difficulty: activeDifficulty,
      initialHp: BOSS_COMBAT.initialHp,
    });
  }
}

function handleBossCollision() {
  if (!state.boss) {
    return;
  }

  if (!checkCollision(player, state.boss)) {
    return;
  }

  state.bossDotSecondsLeft = BOSS_COMBAT.dotDurationSeconds;
  state.bossDotDamagePerSecond = BOSS_COMBAT.dotDamagePerSecond;

  let bossTookFatal = false;
  if (state.bossDamageToBossCooldownFrames <= 0) {
    bossTookFatal = state.boss.applyDamage(
      getBossDamagePerHit(player.width, state.boss.width),
    );
    state.bossDamageToBossCooldownFrames = BOSS_COMBAT.damageToBossCooldownFrames;
  }

  player.playInteractAnimation();

  if (bossTookFatal) {
    destroyBoss();
  }
}

function handleCollision(entity, index) {
  const result = getCollisionOutcome({
    category: entity.category,
    playerWidth: player.width,
    entityWidth: entity.width,
    entityArea: entity.width * entity.height,
    entityScoreValue: entity.config.scoreValue,
    playerInvincibleTimer: player.invincibleTimer,
    difficulty: activeDifficulty,
  });

  if (result.removeEntity) {
    entity.destroy(removeView);
    state.entities.splice(index, 1);
  }

  const nextState = applyCollisionResult({
    score: state.score,
    hp: state.hp,
    maxHp: state.maxHp,
    targetWidth: player.targetWidth,
    result,
  });

  state.score = nextState.score;
  state.hp = nextState.hp;
  state.maxHp = nextState.maxHp;
  player.targetWidth = nextState.targetWidth;
  player.invincibleTimer = nextState.invincibleTimer;
  player.maxHp = state.maxHp;

  if (nextState.healedHp) {
    player.flashHealText();
  }

  if (result.shouldPlayInteract) {
    player.playInteractAnimation();
  }

  if (state.hp <= 0) {
    endGame();
  }
}

function updateEntities() {
  for (let index = state.entities.length - 1; index >= 0; index--) {
    const entity = state.entities[index];
    entity.update();

    if (checkCollision(player, entity)) {
      handleCollision(entity, index);
      if (state.isGameOver) {
        return;
      }
    } else if (entity.isOffScreen()) {
      entity.destroy(removeView);
      state.entities.splice(index, 1);
    }
  }
}

function updateDemoTarget() {
  state.demoDecisionTimer -= 1;

  const threats = [];
  const opportunities = [];

  state.entities.forEach((entity) => {
    const dx = entity.logicalX - player.logicalX;
    const dy = entity.logicalY - player.logicalY;
    const distance = Math.hypot(dx, dy) || 1;
    const isThreat =
      entity.category !== "fish" || entity.width > player.width * 1.2;

    if (isThreat) {
      threats.push({ dx, dy, distance });
      return;
    }

    opportunities.push({
      x: entity.logicalX,
      y: entity.logicalY,
      distance,
      weight: entity.category === "reward" ? 2.4 : 1.2,
    });
  });

  let steerX = 0;
  let steerY = 0;

  threats.forEach((threat) => {
    if (threat.distance > 420) {
      return;
    }

    const force = (420 - threat.distance) / 420;
    steerX -= (threat.dx / threat.distance) * force * 2.6;
    steerY -= (threat.dy / threat.distance) * force * 2.6;
  });

  const closestOpportunity = opportunities.sort(
    (left, right) => left.distance - right.distance,
  )[0];

  if (closestOpportunity) {
    steerX +=
      ((closestOpportunity.x - player.logicalX) / closestOpportunity.distance) *
      closestOpportunity.weight;
    steerY +=
      ((closestOpportunity.y - player.logicalY) / closestOpportunity.distance) *
      closestOpportunity.weight;
  }

  const shouldRetarget =
    state.demoDecisionTimer <= 0 ||
    Math.hypot(state.demoTargetX - player.logicalX, state.demoTargetY - player.logicalY) < 80;

  if (shouldRetarget) {
    state.demoDecisionTimer = 45 + Math.floor(Math.random() * 45);
    state.demoTargetX = 220 + Math.random() * (GAME_WIDTH - 440);
    state.demoTargetY = 180 + Math.random() * (GAME_HEIGHT - 360);
  }

  const wanderDx = state.demoTargetX - player.logicalX;
  const wanderDy = state.demoTargetY - player.logicalY;
  const wanderDistance = Math.hypot(wanderDx, wanderDy) || 1;

  steerX += (wanderDx / wanderDistance) * 0.35;
  steerY += (wanderDy / wanderDistance) * 0.35;

  clearDemoInput();

  if (steerX > 0.12) {
    demoKeys.d = true;
    demoKeys.arrowright = true;
  } else if (steerX < -0.12) {
    demoKeys.a = true;
    demoKeys.arrowleft = true;
  }

  if (steerY > 0.12) {
    demoKeys.s = true;
    demoKeys.arrowdown = true;
  } else if (steerY < -0.12) {
    demoKeys.w = true;
    demoKeys.arrowup = true;
  }
}

function stepGame(delta) {
  if (state.isGameOver) {
    return;
  }

  applyBossDot(delta);
  if (state.isGameOver) {
    return;
  }

  if (!updateTime(delta)) {
    return;
  }

  spawnBossIfNeeded();
  spawnEntities(delta);
  if (state.mode === "demo") {
    updateDemoTarget();
  }

  player.maxHp = state.maxHp;
  player.update(state.mode === "demo" ? demoKeys : keys, state.hp);
  if (state.boss) {
    if (state.bossDamageToBossCooldownFrames > 0) {
      state.bossDamageToBossCooldownFrames -= 1;
    }
    state.boss.update(player);
    handleBossCollision();
    if (state.isGameOver) {
      return;
    }
  }
  updateEntities();
  player.updateHpBar(state.hp);

  if (scoreDisplay) {
    scoreDisplay.text = String(state.score);
  }
}

function gameLoop() {
  if (state.isGameOver) {
    accumulatedTimeMs = 0;
    return;
  }

  accumulatedTimeMs += Math.min(app.ticker.elapsedMS, MAX_FRAME_TIME_MS);

  // Run the simulation at a fixed 60 Hz so browser/frame variance changes
  // smoothness but not spawn cadence, movement, or overall difficulty.
  while (accumulatedTimeMs >= FIXED_TIMESTEP_MS) {
    stepGame(1);
    accumulatedTimeMs -= FIXED_TIMESTEP_MS;

    if (state.isGameOver) {
      accumulatedTimeMs = 0;
      break;
    }
  }
}

function loadGame() {
  loadGameAssets(GAME_CONFIG, updateLoadingText)
    .then((resources) => {
      loadedResources = resources;
      loadingScreen.style.display = "none";
      if (loadingText) {
        loadingText.innerText = "";
      }

      const bgSprite = createBackground(resources[GAME_CONFIG.bgUrl], {
        width: GAME_WIDTH,
        height: GAME_HEIGHT,
      });
      app.stage.addChildAt(bgSprite, 0);

      scoreDisplay = createScoreDisplay(app, resources[GAME_CONFIG.scoreUIUrl]);
      createVisualObject = createVisualObjectFactory(app, resources);

      app.ticker.add(gameLoop);
      startGame(initialMode);
    })
    .catch((error) => {
      console.error("加载资源出错, 请检查路径:", error);
      if (loadingText) {
        loadingText.innerText = "加载失败，请按 F12 查看报错";
      }
    });
}

loadGame();
