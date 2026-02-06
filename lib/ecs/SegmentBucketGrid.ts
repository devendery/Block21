import { World, isSegmentCreatingCollision, MAX_SEGMENTS } from "../game/core/World";
import { CELL_SIZE } from "./BucketGrid";

const GRID_SIZE = 128;
export const segmentBuckets: number[][] = [];
const dirtyBucketFlags = new Uint8Array(GRID_SIZE * GRID_SIZE);
const dirtyBucketIds: number[] = [];
const segmentBucketIndex = new Int32Array(MAX_SEGMENTS);
const segmentBucketPos = new Int32Array(MAX_SEGMENTS);

segmentBucketIndex.fill(-1);
segmentBucketPos.fill(-1);

for (let i = 0; i < GRID_SIZE * GRID_SIZE; i++) {
  segmentBuckets[i] = [];
}

function gridIndex(x: number, y: number) {
  const gx = Math.floor(x / CELL_SIZE) + GRID_SIZE / 2;
  const gy = Math.floor(y / CELL_SIZE) + GRID_SIZE / 2;
  return gx + gy * GRID_SIZE;
}

function markDirtyBucket(idx: number): void {
  if (dirtyBucketFlags[idx] === 0) {
    dirtyBucketFlags[idx] = 1;
    dirtyBucketIds.push(idx);
  }
}

function removeFromBucket(s: number): void {
  const idx = segmentBucketIndex[s];
  if (idx < 0) return;
  const bucket = segmentBuckets[idx];
  const pos = segmentBucketPos[s];

  if (pos >= 0 && pos < bucket.length && bucket[pos] === s) {
    const last = bucket[bucket.length - 1];
    bucket[pos] = last;
    bucket.pop();
    segmentBucketPos[last] = pos;
  } else {
    let found = -1;
    for (let i = 0; i < bucket.length; i++) {
      if (bucket[i] === s) {
        found = i;
        break;
      }
    }
    if (found >= 0) {
      const last = bucket[bucket.length - 1];
      bucket[found] = last;
      bucket.pop();
      segmentBucketPos[last] = found;
    }
  }

  segmentBucketIndex[s] = -1;
  segmentBucketPos[s] = -1;
}

export function onSegmentWritten(s: number): void {
  const ownerId = World.segmentOwner[s] | 0;
  if (!World.snakeAlive[ownerId]) {
    removeFromBucket(s);
    return;
  }
  if (!isSegmentCreatingCollision(ownerId, s)) {
    removeFromBucket(s);
    return;
  }

  const x = World.segmentX[s];
  const y = World.segmentY[s];
  const idx = gridIndex(x, y);
  if (idx < 0 || idx >= segmentBuckets.length) {
    removeFromBucket(s);
    return;
  }

  const prevIdx = segmentBucketIndex[s];
  if (prevIdx === idx) return;
  if (prevIdx >= 0) removeFromBucket(s);

  const bucket = segmentBuckets[idx];
  bucket.push(s);
  segmentBucketIndex[s] = idx;
  segmentBucketPos[s] = bucket.length - 1;
  markDirtyBucket(idx);
}

export function rebuildSegmentBuckets() {
  for (let i = 0; i < dirtyBucketIds.length; i++) {
    const idx = dirtyBucketIds[i];
    segmentBuckets[idx].length = 0;
    dirtyBucketFlags[idx] = 0;
  }
  dirtyBucketIds.length = 0;
  segmentBucketIndex.fill(-1);
  segmentBucketPos.fill(-1);

  for (let s = 0; s < MAX_SEGMENTS; s++) {
    const x = World.segmentX[s];
    const y = World.segmentY[s];
    const ownerId = World.segmentOwner[s];
    if (!isSegmentCreatingCollision(ownerId, s)) continue;
    const idx = gridIndex(x, y);
    if (idx < 0 || idx >= segmentBuckets.length) continue;
    const bucket = segmentBuckets[idx];
    bucket.push(s);
    segmentBucketIndex[s] = idx;
    segmentBucketPos[s] = bucket.length - 1;
    markDirtyBucket(idx);
  }
}

export function queryNearbySegments(x: number, y: number, results: number[]) {
  const gx = Math.floor(x / CELL_SIZE) + GRID_SIZE / 2;
  const gy = Math.floor(y / CELL_SIZE) + GRID_SIZE / 2;
  for (let dx = -1; dx <= 1; dx++) {
    for (let dy = -1; dy <= 1; dy++) {
      const nx = gx + dx;
      const ny = gy + dy;
      const idx = nx + ny * GRID_SIZE;
      if (idx < 0 || idx >= segmentBuckets.length) continue;
      const bucket = segmentBuckets[idx];
      for (let k = 0; k < bucket.length; k++) results.push(bucket[k]);
    }
  }
}

export function queryNearbySegmentsInto(x: number, y: number, out: Uint16Array): number {
  let count = 0;
  const gx = Math.floor(x / CELL_SIZE) + GRID_SIZE / 2;
  const gy = Math.floor(y / CELL_SIZE) + GRID_SIZE / 2;
  for (let dx = -1; dx <= 1; dx++) {
    for (let dy = -1; dy <= 1; dy++) {
      const nx = gx + dx;
      const ny = gy + dy;
      const idx = nx + ny * GRID_SIZE;
      if (idx < 0 || idx >= segmentBuckets.length) continue;
      const bucket = segmentBuckets[idx];
      for (let k = 0; k < bucket.length; k++) {
        if (count >= out.length) return count;
        out[count++] = bucket[k] as unknown as number;
      }
    }
  }
  return count;
}
