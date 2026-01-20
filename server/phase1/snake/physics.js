function clamp(v, a, b) {
  return Math.max(a, Math.min(b, v));
}

function normalizeAngle(a) {
  let x = a;
  while (x > Math.PI) x -= Math.PI * 2;
  while (x < -Math.PI) x += Math.PI * 2;
  return x;
}

function angleStep(current, target, turnSpeed, dt) {
  const diff = normalizeAngle(target - current);
  const step = clamp(diff, -turnSpeed * dt, turnSpeed * dt);
  return normalizeAngle(current + step);
}

function dist2(ax, ay, bx, by) {
  const dx = ax - bx;
  const dy = ay - by;
  return dx * dx + dy * dy;
}

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

module.exports = {
  normalizeAngle,
  angleStep,
  dist2,
  buildSegmentBuckets,
  getNearbyBucketItems,
  pushTrail,
  sampleTrailByIndex,
};

