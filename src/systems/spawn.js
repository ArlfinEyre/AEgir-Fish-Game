import { SPAWN_RULES } from "../config.js";
import { getDifficultyPreset, getSpawnInterval } from "./difficulty.js";

export function getSpawnCategories(
  spawnTimer,
  delta,
  elapsedSeconds = 0,
  difficulty = getDifficultyPreset(),
) {
  return SPAWN_RULES.filter(
    (rule) =>
      spawnTimer %
        getSpawnInterval(rule.interval, elapsedSeconds, difficulty, rule.category) <
      delta,
  ).map((rule) => rule.category);
}
