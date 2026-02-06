import { World } from "./World";

export function updateMovement() {
  const n = World.snakeCount;
  for (let i = 0; i < n; i++) {
    if (!World.snakeAlive[i]) continue;
    World.snakePosX[i] += World.snakeVelX[i];
    World.snakePosY[i] += World.snakeVelY[i];
  }
}
