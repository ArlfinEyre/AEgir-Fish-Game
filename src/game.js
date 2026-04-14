import { createAssets } from "./assets.js";
import { INITIAL_HP, INITIAL_SCORE } from "./config.js";
import { Entity } from "./entities/entity.js";
import { Player } from "./entities/player.js";
import { checkCollision } from "./systems/collision.js";
import { saveScore } from "./systems/leaderboard.js";
import { resolveEntityCollision } from "./systems/rules.js";
import { getSpawnTypes } from "./systems/spawn.js";

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const scoreDisplay = document.getElementById("score-display");
const hpDisplay = document.getElementById("hp-display");
const gameOverScreen = document.getElementById("game-over-screen");
const finalScoreDisplay = document.getElementById("final-score");
const leaderboardList = document.getElementById("leaderboard-list");
const restartButton = document.getElementById("restart-button");

const assets = createAssets();
const keys = {};

const state = {
  isGameOver: false,
  score: INITIAL_SCORE,
  hp: INITIAL_HP,
  entities: [],
  player: null,
  spawnTimer: 0,
};

window.addEventListener("keydown", (event) => {
  keys[event.key.toLowerCase()] = true;

  if (event.code === "Space" && state.isGameOver) {
    startGame();
  }
});

window.addEventListener("keyup", (event) => {
  keys[event.key.toLowerCase()] = false;
});

restartButton.addEventListener("click", startGame);

function renderLeaderboard(scores) {
  leaderboardList.innerHTML = "";

  scores.forEach((score, index) => {
    leaderboardList.innerHTML += `<li>第 ${index + 1} 名: ${score} 分</li>`;
  });
}

function startGame() {
  gameOverScreen.style.display = "none";
  state.player = new Player(assets);
  state.entities = [];
  state.score = INITIAL_SCORE;
  state.hp = INITIAL_HP;
  state.spawnTimer = 0;
  state.isGameOver = false;
  gameLoop();
}

function endGame() {
  state.isGameOver = true;
  gameOverScreen.style.display = "flex";
  finalScoreDisplay.innerText = state.score;
  renderLeaderboard(saveScore(state.score));
}

function drawBackground() {
  if (assets.bg.complete && assets.bg.naturalWidth !== 0) {
    ctx.drawImage(assets.bg, 0, 0, canvas.width, canvas.height);
    return;
  }

  ctx.fillStyle = "#0a4263";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function updateHud() {
  scoreDisplay.innerText = state.score;
  hpDisplay.innerText = state.hp;
}

function updateEntities() {
  for (let index = state.entities.length - 1; index >= 0; index--) {
    const entity = state.entities[index];
    entity.update();
    entity.draw(ctx);

    if (checkCollision(state.player, entity)) {
      const result = resolveEntityCollision({
        entityType: entity.type,
        playerArea: state.player.width * state.player.height,
        entityArea: entity.width * entity.height,
        playerInvincibleTimer: state.player.invincibleTimer,
      });

      state.score += result.scoreDelta;
      state.hp += result.hpDelta;
      state.player.targetWidth += result.targetWidthDelta;
      state.player.invincibleTimer = result.nextInvincibleTimer;

      if (result.removeEntity) {
        state.entities.splice(index, 1);
      }

      if (state.hp <= 0) {
        endGame();
        return;
      }
    } else if (entity.isOffScreen()) {
      state.entities.splice(index, 1);
    }
  }
}

function spawnEntities() {
  state.spawnTimer++;

  getSpawnTypes(state.spawnTimer).forEach((type) => {
    state.entities.push(new Entity(type, assets));
  });
}

function gameLoop() {
  if (state.isGameOver) {
    return;
  }

  drawBackground();
  spawnEntities();
  state.player.update(keys);
  state.player.draw(ctx);
  updateEntities();
  updateHud();

  if (!state.isGameOver) {
    requestAnimationFrame(gameLoop);
  }
}

startGame();
