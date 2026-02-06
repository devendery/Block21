import { World, isSegmentCreatingCollision, MAX_SNAKES, MAX_SEGMENTS } from "../../game/core/World";
import { queryNearbySegmentsInto } from "../SegmentBucketGrid";

const TEMP_SEGMENTS = new Uint16Array(MAX_SEGMENTS);
const SEGMENTS_BY_OWNER = new Uint16Array(MAX_SEGMENTS);
const OWNER_LIST = new Uint16Array(MAX_SNAKES);
const OWNER_MARK = new Uint8Array(MAX_SNAKES);
const OWNER_TOTAL = new Uint16Array(MAX_SNAKES);
const OWNER_WRITE = new Uint16Array(MAX_SNAKES);
const OWNER_START = new Uint16Array(MAX_SNAKES);

function distPointToSegmentSq(px: number, py: number, ax: number, ay: number, bx: number, by: number): number {
  const abx = bx - ax;
  const aby = by - ay;
  const apx = px - ax;
  const apy = py - ay;
  const denom = abx * abx + aby * aby;
  if (denom < 1e-6) {
    const dx = px - ax;
    const dy = py - ay;
    return dx * dx + dy * dy;
  }
  let t = (apx * abx + apy * aby) / denom;
  if (t < 0) t = 0;
  else if (t > 1) t = 1;
  const cx = ax + t * abx;
  const cy = ay + t * aby;
  const dx = px - cx;
  const dy = py - cy;
  return dx * dx + dy * dy;
}

function insertionSortRange(arr: Uint16Array, start: number, end: number): void {
  for (let i = start + 1; i < end; i++) {
    const key = arr[i];
    let j = i - 1;
    while (j >= start && arr[j] > key) {
      arr[j + 1] = arr[j];
      j--;
    }
    arr[j + 1] = key;
  }
}

export function updateCollision() {
  const n = World.snakeCount;
  World.toKill.length = 0;

  for (let i = 0; i < n; i++) {
    if (!World.snakeAlive[i]) continue;

    const hx = World.snakePosX[i];
    const hy = World.snakePosY[i];
    const rBase = World.snakeRadius[i];

    const tempCount = queryNearbySegmentsInto(hx, hy, TEMP_SEGMENTS);

    let ownerCount = 0;
    for (let t = 0; t < tempCount; t++) {
      const s = TEMP_SEGMENTS[t];
      const owner = World.segmentOwner[s] | 0;
      if (owner === i) continue;
      if (!World.snakeAlive[owner]) continue;
      if (!isSegmentCreatingCollision(owner, s)) continue;

      if (OWNER_MARK[owner] === 0) {
        OWNER_MARK[owner] = 1;
        OWNER_LIST[ownerCount++] = owner;
        OWNER_TOTAL[owner] = 0;
      }
      OWNER_TOTAL[owner] = (OWNER_TOTAL[owner] + 1) as unknown as number;
    }

    let writePos = 0;
    for (let k = 0; k < ownerCount; k++) {
      const owner = OWNER_LIST[k] | 0;
      OWNER_START[owner] = writePos as unknown as number;
      OWNER_WRITE[owner] = 0;
      writePos += OWNER_TOTAL[owner];
    }

    for (let t = 0; t < tempCount; t++) {
      const s = TEMP_SEGMENTS[t];
      const owner = World.segmentOwner[s] | 0;
      if (OWNER_MARK[owner] === 0) continue;
      if (owner === i) continue;
      if (!World.snakeAlive[owner]) continue;
      if (!isSegmentCreatingCollision(owner, s)) continue;

      const dst = (OWNER_START[owner] + OWNER_WRITE[owner]) | 0;
      SEGMENTS_BY_OWNER[dst] = s;
      OWNER_WRITE[owner] = (OWNER_WRITE[owner] + 1) as unknown as number;
    }

    let killed = false;
    for (let k = 0; k < ownerCount; k++) {
      const owner = OWNER_LIST[k] | 0;
      const count = OWNER_TOTAL[owner] | 0;
      if (count <= 0) continue;

      const start = OWNER_START[owner] | 0;
      const end = start + count;

      if (count > 1) {
        insertionSortRange(SEGMENTS_BY_OWNER, start, end);
      }

      const rSum = rBase + World.snakeRadius[owner];
      const rSumSq = rSum * rSum;

      if (count === 1) {
        const s = SEGMENTS_BY_OWNER[start];
        const dx = hx - World.segmentX[s];
        const dy = hy - World.segmentY[s];
        if (dx * dx + dy * dy <= rSumSq) {
          World.toKill.push(i);
          killed = true;
        }
      } else {
        for (let j = start; j < end - 1; j++) {
          const a = SEGMENTS_BY_OWNER[j];
          const b = SEGMENTS_BY_OWNER[j + 1];
          const ax = World.segmentX[a];
          const ay = World.segmentY[a];
          const bx = World.segmentX[b];
          const by = World.segmentY[b];

          const d2 = distPointToSegmentSq(hx, hy, ax, ay, bx, by);
          if (d2 <= rSumSq) {
            World.toKill.push(i);
            killed = true;
            break;
          }
        }
      }

      OWNER_MARK[owner] = 0;
      OWNER_TOTAL[owner] = 0;
      OWNER_WRITE[owner] = 0;

      if (killed) break;
    }

    for (let k = 0; k < ownerCount; k++) {
      const owner = OWNER_LIST[k] | 0;
      OWNER_MARK[owner] = 0;
      OWNER_TOTAL[owner] = 0;
      OWNER_WRITE[owner] = 0;
    }
  }
}
