import { SPAWN_RULES } from "../config.js";

export function getSpawnCategories(spawnTimer, delta) {
  return SPAWN_RULES.filter(
    (rule) => spawnTimer % rule.interval < delta,
  ).map((rule) => rule.category);
}
