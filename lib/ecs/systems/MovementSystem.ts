import { World } from "../../game/core/World";

export function updateMovement() {
  const n = World.snakeCount;
  for (let i = 0; i < n; i++) {
    if (!World.snakeAlive[i]) continue;
    const px = World.snakePosX[i];
    const py = World.snakePosY[i];
    const vx = World.snakeVelX[i];
    const vy = World.snakeVelY[i];

    if (!Number.isFinite(px) || !Number.isFinite(py) || !Number.isFinite(vx) || !Number.isFinite(vy)) {
      World.snakePosX[i] = 0;
      World.snakePosY[i] = 0;
      World.snakeVelX[i] = 0;
      World.snakeVelY[i] = 0;
      continue;
    }

    World.snakePosX[i] = px + vx;
    World.snakePosY[i] = py + vy;
  }
}
