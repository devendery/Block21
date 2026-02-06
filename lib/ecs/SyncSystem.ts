import { World } from "../game/core/World";

export function syncLegacySnakes(snakes: any[]) {
  for (let i = 0; i < snakes.length; i++) {
    const snake = snakes[i];
    const id = snake?.ecsId;
    if (typeof id !== "number" || id < 0) continue;
    const x = World.snakePosX[id];
    const y = World.snakePosY[id];
    const alive = World.snakeAlive[id] === 1;

    if (snake.player) {
      snake.player.x = x;
      snake.player.y = y;
      snake.player.alive = alive;
      snake.player.headIndex = World.segmentHead[id] | 0;
      snake.player.tailIndex = World.segmentTail[id] | 0;
    } else {
      snake.x = x;
      snake.y = y;
      snake.alive = alive;
    }
  }
}
