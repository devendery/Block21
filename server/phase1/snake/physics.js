const BASE_SPEED = 6.0;
const MAX_SPEED = 9.0;
const BOOST_MULT = 1.35;
const BOOST_MASS_DRAIN = 1.0;
const MIN_BOOST_MASS = 6;
const MAX_TURN_RATE = 2.8; // rad/sec
const TURN_PENALTY = 0.18;
const ACCEL_TIME = 0.35; // Kept for velocity interpolation, but strictly physics-based

// Helper: Clamp value between min and max
function clamp(v, a, b) {
  return Math.max(a, Math.min(b, v));
}

// Helper: Normalize angle to -PI to PI
function normalizeAngle(a) {
  let x = a;
  while (x > Math.PI) x -= Math.PI * 2;
  while (x < -Math.PI) x += Math.PI * 2;
  return x;
}

// Helper: Step angle towards target with max turn speed
function angleStep(current, target, turnSpeed, dt) {
  const diff = normalizeAngle(target - current);
  const step = clamp(diff, -turnSpeed * dt, turnSpeed * dt);
  return normalizeAngle(current + step);
}

// Helper: Distance squared
function dist2(ax, ay, bx, by) {
  const dx = ax - bx;
  const dy = ay - by;
  return dx * dx + dy * dy;
}

// Helper: Distance
function dist(x1, y1, x2, y2) {
  return Math.hypot(x2 - x1, y2 - y1);
}

// --- SPATIAL HASHING (Buckets) ---

function bucketKey(x, y) {
  return `${x},${y}`;
}

function addToBucket(map, x, y, item) {
  const k = bucketKey(x, y);
  const arr = map.get(k);
  if (arr) arr.push(item);
  else map.set(k, [item]);
}

function buildSegmentBuckets(entries, cellSize) {
  const buckets = new Map();
  for (const e of entries) {
    const ix = Math.floor(e.x / cellSize);
    const iy = Math.floor(e.y / cellSize);
    addToBucket(buckets, ix, iy, e);
  }
  return buckets;
}

function getNearbyBucketItems(buckets, x, y, cellSize) {
  const ix = Math.floor(x / cellSize);
  const iy = Math.floor(y / cellSize);
  const out = [];
  for (let dx = -1; dx <= 1; dx++) {
    for (let dy = -1; dy <= 1; dy++) {
      const arr = buckets.get(bucketKey(ix + dx, iy + dy));
      if (arr) out.push(...arr);
    }
  }
  return out;
}

// --- TRAIL MANAGEMENT ---

function pushTrail(trail, x, y, max) {
  trail.unshift({ x, y });
  while (trail.length > max) trail.pop();
}

function sampleTrailByIndex(trail, segmentCount, spacingSteps) {
  const pts = [];
  for (let i = 0; i < segmentCount; i++) {
    const idx = i * spacingSteps;
    if (idx >= trail.length) break;
    const p = trail[idx];
    pts.push({ x: p.x, y: p.y });
  }
  return pts;
}

// --- CORE PHYSICS UPDATE ---

/**
 * Updates a single player's physics state.
 * Strictly 20Hz logic: Velocity based, no client-side easing on server.
 */
function updatePlayerPhysics(id, p, phys, dt, options = {}) {
  // Fix 5: Hard stop physics for dead players
  if (!p || !p.alive || !phys) {
    if (p) p.speed = 0;
    return;
  }

  const {
    baseSpeed = BASE_SPEED,
    maxSpeed = MAX_SPEED,
    boostMult = BOOST_MULT,
    turnRate = MAX_TURN_RATE,
    friction = 0, // Not used in Phase 1 Canon, but kept for interface compatibility if needed
    baseMapW = 96,
    baseMapH = 56,
  } = options;

  // 1. Turn
  // Server strictly updates angle based on turn speed. No lerp/easing.
  const maxTurn = turnRate * dt;
  p.angle = angleStep(p.angle, p.targetAngle, turnRate, dt);

  // 2. Speed Calculation
  let targetSpeed = baseSpeed;
  if (p.boosting && p.mass > MIN_BOOST_MASS) {
    targetSpeed *= boostMult;
    p.mass -= BOOST_MASS_DRAIN * dt; // Drain mass while boosting
  }

  // Phase-1 Canon: Deterministic Linear Acceleration
  const accelPerSec = (maxSpeed - baseSpeed) / ACCEL_TIME;
  const delta = accelPerSec * dt;

  if (p.speed < targetSpeed) {
    p.speed = Math.min(targetSpeed, p.speed + delta);
  } else {
    p.speed = Math.max(targetSpeed, p.speed - delta);
  }

  // Turn penalty (Constant, not speed-scaled)
  p.speed *= 1 - TURN_PENALTY;

  // 3. Position Update (Velocity Integration)
  // New Pos = Old Pos + (Velocity * dt)
  const vx = Math.cos(p.angle) * p.speed;
  const vy = Math.sin(p.angle) * p.speed;
  
  p.x += vx * dt;
  p.y += vy * dt;

  // 4. Update Growth & Radius
  // length = mass * 0.85 (min 5)
  p.length = Math.max(5, Math.floor(p.mass * 0.85));
  // radius = 0.35 + length * 0.0025 (clamped)
  p.radius = clamp(0.35 + p.length * 0.0025, 0.35, 1.1);
  p.dangerRadius = p.radius * 1.35; // Hitbox is slightly larger than visual radius

  // 5. Trail Management
  // Save trail for collision checking and rendering
  // Logic max segments is usually higher than render max
  const trailMax = 5 * (Math.min(p.length, 240) + 20); // 5 = spacingSteps
  pushTrail(phys.trail, p.x, p.y, trailMax);
}

// --- COLLISION LOGIC ---

/**
 * Checks all collisions: Wall, Body, Head-to-Head.
 * Returns a Set of dead player IDs.
 */
function checkCollisions(playersState, physicsMap, gridW, gridH) {
  const deadIds = new Set();
  const headEntries = [];
  const segmentEntries = [];

  // 1. Prepare Data & Check Walls
  for (const [id, p] of playersState) {
    if (!p.alive || deadIds.has(id)) continue;
    
    // STRICT WALL COLLISION
    // If head touches boundary -> DEAD
    // Phase-1 Canon: Radius-aware check
    if (
      p.x <= p.dangerRadius || 
      p.x >= gridW - p.dangerRadius || 
      p.y <= p.dangerRadius || 
      p.y >= gridH - p.dangerRadius
    ) {
      deadIds.add(id);
      continue;
    }

    const phys = physicsMap.get(id);
    if (!phys) continue;

    headEntries.push({ id, x: p.x, y: p.y, radius: p.dangerRadius, mass: p.mass });

    // Collect segments for body collision
    // Skip first few segments (head) to avoid self-collision
    const segs = sampleTrailByIndex(phys.trail, p.length, 5); // spacingSteps=5
    // Skip first 2 logic segments (approx 10 trail points)
    for (let i = 2; i < segs.length; i++) {
      const s = segs[i];
      // Fix 4: Smaller radius for body segments (0.6x)
      segmentEntries.push({ owner: id, x: s.x, y: s.y, radius: p.dangerRadius * 0.6 }); 
    }
  }

  // Build spatial hash for segments
  const buckets = buildSegmentBuckets(segmentEntries, 2.0); // Bucket size ~2.0

  // 2. Head vs Body (Self & Others)
  for (const head of headEntries) {
    if (deadIds.has(head.id)) continue;

    const nearby = getNearbyBucketItems(buckets, head.x, head.y, 2.0);
    for (const seg of nearby) {
      // Collision distance = head.radius + segment.radius (which is owner.radius)
      // We stored radius in segment entry
      const minD = head.radius + seg.radius * 0.8; // slightly forgiving on body checks? No, strict.
      // Actually Canon says: "intersects ANY segment".
      // Let's use standard circle-circle.
      const minDist = head.radius + seg.radius;
      
      if (dist2(head.x, head.y, seg.x, seg.y) < minDist * minDist) {
        deadIds.add(head.id);
        break; 
      }
    }
  }

  // 3. Head vs Head
  for (let i = 0; i < headEntries.length; i++) {
    for (let j = i + 1; j < headEntries.length; j++) {
      const a = headEntries[i];
      const b = headEntries[j];

      if (deadIds.has(a.id) && deadIds.has(b.id)) continue; // Both already dead?

      const minDist = a.radius + b.radius;
      if (dist2(a.x, a.y, b.x, b.y) < minDist * minDist) {
        // Collision! Check mass.
        if (a.mass > b.mass) {
          deadIds.add(b.id);
        } else if (b.mass > a.mass) {
          deadIds.add(a.id);
        } else {
          // Equal mass -> Both die
          deadIds.add(a.id);
          deadIds.add(b.id);
        }
      }
    }
  }

  return deadIds;
}

module.exports = {
  // Helpers
  normalizeAngle,
  angleStep,
  dist2,
  dist,
  clamp,
  pushTrail,
  sampleTrailByIndex,
  
  // Spatial
  buildSegmentBuckets,
  getNearbyBucketItems,
  
  // Core Logic
  updatePlayerPhysics,
  checkCollisions,
};
