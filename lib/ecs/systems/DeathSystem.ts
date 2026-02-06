import { World } from "../../game/core/World";

export function processDeaths() {
  for (let k = 0; k < World.toKill.length; k++) {
    const id = World.toKill[k] | 0;
    if (id >= 0 && id < World.snakeCount) {
      World.snakeAlive[id] = 0;
    }
  }
  World.toKill.length = 0;
}
