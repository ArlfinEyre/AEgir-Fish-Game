const STORAGE_KEY = "fishGameScores";

export function saveScore(score, storage = window.localStorage) {
  const board = loadScores(storage);
  board.push(score);
  board.sort((a, b) => b - a);

  const topScores = board.slice(0, 5);
  storage.setItem(STORAGE_KEY, JSON.stringify(topScores));

  return topScores;
}

export function loadScores(storage = window.localStorage) {
  return JSON.parse(storage.getItem(STORAGE_KEY)) || [];
}
