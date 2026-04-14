import { ENTITY_TYPES } from "../config.js";

export function getSpawnTypes(spawnTimer) {
  const spawnTypes = [];

  if (spawnTimer % 50 === 0) {
    spawnTypes.push(ENTITY_TYPES.FISH);
  }
  if (spawnTimer % 800 === 0) {
    spawnTypes.push(ENTITY_TYPES.REWARD);
  }
  if (spawnTimer % 900 === 0) {
    spawnTypes.push(ENTITY_TYPES.PUNISH);
  }

  return spawnTypes;
}
