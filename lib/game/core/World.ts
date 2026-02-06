export const MAX_SNAKES = 1024;
export const MAX_SEGMENTS = 20000;
export const MAX_SEG_PER_SNAKE = 120;

export const World = {
  snakeCount: 0,
  tickCounter: 0,

  snakePosX: new Float32Array(MAX_SNAKES),
  snakePosY: new Float32Array(MAX_SNAKES),

  snakeVelX: new Float32Array(MAX_SNAKES),
  snakeVelY: new Float32Array(MAX_SNAKES),

  snakeRadius: new Float32Array(MAX_SNAKES),
  snakeMass: new Float32Array(MAX_SNAKES),
  snakeLength: new Float32Array(MAX_SNAKES),

  snakeAlive: new Uint8Array(MAX_SNAKES),
  snakeBoosting: new Uint8Array(MAX_SNAKES),

  snakeAngle: new Float32Array(MAX_SNAKES),
  snakeSpeed: new Float32Array(MAX_SNAKES),

  snakeScore: new Uint32Array(MAX_SNAKES),
  toKill: [] as number[],

  segmentX: new Float32Array(MAX_SEGMENTS),
  segmentY: new Float32Array(MAX_SEGMENTS),
  segmentOwner: new Uint16Array(MAX_SEGMENTS),
  segmentCount: 0,
  lastSegmentIndex: new Int32Array(MAX_SNAKES),
  segmentHead: new Uint16Array(MAX_SNAKES),
  segmentTail: new Uint16Array(MAX_SNAKES),
  segmentLength: new Uint16Array(MAX_SNAKES),
};

export function allocateSegment(ownerId: number, x: number, y: number): number {
  const i = World.segmentCount % MAX_SEGMENTS;
  World.segmentX[i] = x;
  World.segmentY[i] = y;
  World.segmentOwner[i] = ownerId;
  const len = World.segmentLength[ownerId] | 0;
  if (len === 0) {
    World.segmentTail[ownerId] = i;
    World.segmentHead[ownerId] = i;
    World.segmentLength[ownerId] = 1;
  } else {
    World.segmentHead[ownerId] = i;
    World.segmentLength[ownerId] = len + 1;
    if (World.segmentLength[ownerId] > MAX_SEG_PER_SNAKE) {
      World.segmentTail[ownerId] = (World.segmentTail[ownerId] + 1) % MAX_SEGMENTS;
      World.segmentLength[ownerId] = World.segmentLength[ownerId] - 1;
    }
  }
  World.lastSegmentIndex[ownerId] = i;
  World.segmentCount++;
  return i;
}

export function isSegmentActive(ownerId: number, index: number) {
  if ((World.segmentOwner[index] | 0) !== ownerId) return false;
  const head = World.segmentHead[ownerId];
  const tail = World.segmentTail[ownerId];

  if (tail <= head) {
    return index >= tail && index <= head;
  }

  return index >= tail || index <= head;
}

export function isSegmentCreatingCollision(ownerId: number, index: number) {
  return isSegmentActive(ownerId, index);
}

export function resetWorld() {
  World.snakeCount = 0;
  World.segmentCount = 0;
  World.tickCounter = 0;
  World.snakeAlive.fill(0);
  World.segmentHead.fill(0);
  World.segmentTail.fill(0);
  World.segmentLength.fill(0);
}
