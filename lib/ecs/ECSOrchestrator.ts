import { updateMovement } from "./systems/MovementSystem";
import { updateCollision } from "./systems/CollisionSystem";
import { processDeaths } from "./systems/DeathSystem";
import { updateSegments } from "./systems/SegmentSystem";
import { rebuildSegmentBuckets } from "./SegmentBucketGrid";
import { globalProfiler } from "./Profiler";
import { World } from "../game/core/World";

const FRAME_BUDGET_MS = 16;
let lastSlow = false;
let lastLogAt = 0;
let tickCounter = 0;

export function runECSTick() {
  tickCounter++;
  globalProfiler.startFrame();

  globalProfiler.start("movement");
  updateMovement();
  globalProfiler.end("movement");

  globalProfiler.start("segments");
  updateSegments();
  globalProfiler.end("segments");

  const frameTimeSoFar = performance.now() - globalProfiler.getFrameStartTime();
  const allowCollision = frameTimeSoFar < FRAME_BUDGET_MS * 0.6;

  globalProfiler.start("buckets");
  if (tickCounter % 60 === 0) {
    rebuildSegmentBuckets();
  }
  globalProfiler.end("buckets");

  if (allowCollision) {
    globalProfiler.start("collision");
    updateCollision();
    globalProfiler.end("collision");
  } else {
    lastSlow = true;
  }

  globalProfiler.start("deaths");
  processDeaths();
  globalProfiler.end("deaths");

  globalProfiler.endFrame();
  
  let sumSegmentLengths = 0;
  let aliveSnakes = 0;
  for (let i = 0; i < World.snakeCount; i++) {
    if (!World.snakeAlive[i]) continue;
    aliveSnakes++;
    sumSegmentLengths += World.segmentLength[i] | 0;
  }
  let activeSegments = 0;
  for (let s = 0; s < World.segmentCount; s++) {
    const owner = World.segmentOwner[s] | 0;
    if (!World.snakeAlive[owner]) continue;
    const tail = World.segmentTail[owner];
    const head = World.segmentHead[owner];
    if (s < tail || s > head) continue;
    activeSegments++;
  }
  if (activeSegments !== sumSegmentLengths) {
    const ranges: string[] = [];
    for (let i = 0; i < World.snakeCount; i++) {
      if (!World.snakeAlive[i]) continue;
      ranges.push(`${i}:tail=${World.segmentTail[i]} head=${World.segmentHead[i]} len=${World.segmentLength[i]}`);
    }
    console.error("Segment invariant mismatch", {
      activeSegments,
      sumSegmentLengths,
      segmentCount: World.segmentCount
    });
    console.error("Segment ranges", ranges.join(" | "));
  }
  
  const frameTime = performance.now() - globalProfiler.getFrameStartTime();
  if (frameTime > FRAME_BUDGET_MS) {
    console.warn("Slow frame:", frameTime);
    lastSlow = true;
  } else {
    lastSlow = false;
  }

  const now = performance.now();
  if (now - lastLogAt >= 1000) {
    const movementStats = globalProfiler.getSystemStats("movement");
    const segmentStats = globalProfiler.getSystemStats("segments");
    const bucketStats = globalProfiler.getSystemStats("buckets");
    const collisionStats = globalProfiler.getSystemStats("collision");
    const deathStats = globalProfiler.getSystemStats("deaths");
    
    console.log(
      "frame:", frameTime.toFixed(2),
      "move:", movementStats?.avg.toFixed(2) || "0.00",
      "seg:", segmentStats?.avg.toFixed(2) || "0.00",
      "bucket:", bucketStats?.avg.toFixed(2) || "0.00",
      "coll:", collisionStats?.avg.toFixed(2) || "0.00",
      "snakesAlive:", aliveSnakes,
      "(allocated):", World.snakeCount,
      "segments:", World.segmentCount,
      "activeSegments:", sumSegmentLengths
    );
    lastLogAt = now;
  }
}
