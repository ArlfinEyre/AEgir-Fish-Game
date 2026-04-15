import { LEADERBOARD_STORAGE_KEY } from "../config.js";

export function loadScores(storage = window.localStorage) {
  return JSON.parse(storage.getItem(LEADERBOARD_STORAGE_KEY)) || [];
}

export function saveScore(score, storage = window.localStorage) {
  const board = loadScores(storage);
  board.push(score);
  board.sort((a, b) => b - a);

  const topScores = board.slice(0, 5);
  storage.setItem(LEADERBOARD_STORAGE_KEY, JSON.stringify(topScores));
  return topScores;
}
