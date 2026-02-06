import { World, allocateSegment, MAX_SEGMENTS } from "../../game/core/World";
import { PhysicsConfig } from "../../game/core/Physics";
import { onSegmentWritten } from "../SegmentBucketGrid";

export function updateSegments() {
  const n = World.snakeCount;
  for (let ownerId = 0; ownerId < n; ownerId++) {
    if (!World.snakeAlive[ownerId]) continue;
    const x = World.snakePosX[ownerId];
    const y = World.snakePosY[ownerId];
    const lastIdx = World.lastSegmentIndex[ownerId];
    if (lastIdx < 0) {
      const s = allocateSegment(ownerId, x, y);
      onSegmentWritten(s);
      expireByLength(ownerId);
      continue;
    }
    const dx = x - World.segmentX[lastIdx];
    const dy = y - World.segmentY[lastIdx];
    const d2 = dx * dx + dy * dy;
    const spacing = PhysicsConfig.SEGMENT_DISTANCE;
    if (d2 >= spacing * spacing) {
      const s = allocateSegment(ownerId, x, y);
      onSegmentWritten(s);
    }
    expireByLength(ownerId);
  }
}

function expireByLength(ownerId: number) {
  const head = World.segmentHead[ownerId] | 0;
  let tail = World.segmentTail[ownerId] | 0;
  const maxDistance = World.snakeLength[ownerId] || 0;

  if (maxDistance <= 0) {
    World.segmentTail[ownerId] = tail;
    World.segmentLength[ownerId] = Math.max(World.segmentLength[ownerId] | 0, 1);
    return;
  }

  let remaining = maxDistance;
  let i = head;
  let kept = 1;
  while (i !== tail) {
    let j = i;
    do {
      j = (j - 1 + MAX_SEGMENTS) % MAX_SEGMENTS;
    } while (j !== tail && (World.segmentOwner[j] | 0) !== ownerId);

    if ((World.segmentOwner[j] | 0) !== ownerId) {
      break;
    }

    const dx = World.segmentX[i] - World.segmentX[j];
    const dy = World.segmentY[i] - World.segmentY[j];
    remaining -= Math.sqrt(dx * dx + dy * dy);

    if (remaining < 0) {
      World.segmentTail[ownerId] = i;
      World.segmentLength[ownerId] = kept;
      break;
    }

    i = j;
    kept++;
  }

  if (remaining >= 0) {
    World.segmentLength[ownerId] = kept;
  }
}
