export interface Vector2 {
  x: number;
  y: number;
}

export const PhysicsConfig = {
  // SERVER / PHYSICS (The Truth)
  BASE_SPEED: 220, // Slightly faster for smoother feel
  BOOST_SPEED: 400, // 1.8x boost for high-speed maneuvers
  BASE_TURN_SPEED: Math.PI * 1.8, // Faster turning (was 1.5)
  BASE_RADIUS: 21, // Starting visual radius
  SEGMENT_DISTANCE: 14, // Distance between segment centers
  COLLISION_RADIUS: 18, // Actual hitbox size (constant)
  INTERPOLATION_DELAY: 100, // ms
  MAP_SIZE: 3000, // World boundary
  FOOD_RADIUS: 10,
  FOOD_VALUE: 1,
  AOI_RADIUS: 800,
};

export const VisualConfig = {
  // CLIENT / VISUAL (The Look)
  RENDER_RADIUS: 21, // 1.15x safety buffer over collision
  TAIL_TAPER_START: 0.7, // Taper only last 30%
  TAIL_MIN_SCALE: 0.4, // Tip is 40% size
  GLOW_ALPHA: 0.3,
  SHADOW_ALPHA: 0.4,
};

export function checkCircleCollision(x1: number, y1: number, r1: number, x2: number, y2: number, r2: number): boolean {
  const dx = x1 - x2;
  const dy = y1 - y2;
  const distSq = dx * dx + dy * dy;
  const radSum = r1 + r2;
  return distSq < radSum * radSum;
}

export function normalize(v: Vector2): Vector2 {
  const len = Math.sqrt(v.x * v.x + v.y * v.y);
  if (len === 0) return { x: 0, y: 0 };
  return { x: v.x / len, y: v.y / len };
}

export function distance(a: Vector2, b: Vector2): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

export function lerp(start: number, end: number, t: number): number {
  return start * (1 - t) + end * t;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

// Shortest angle difference
export function angleDifference(current: number, target: number): number {
  let diff = target - current;
  while (diff < -Math.PI) diff += Math.PI * 2;
  while (diff > Math.PI) diff -= Math.PI * 2;
  return diff;
}

export function wrapAngle(angle: number): number {
  while (angle < -Math.PI) angle += Math.PI * 2;
  while (angle > Math.PI) angle -= Math.PI * 2;
  return angle;
}

export function rotateTowards(current: number, target: number, maxStep: number): number {
  const diff = angleDifference(current, target);
  if (Math.abs(diff) < maxStep) return target;
  return wrapAngle(current + Math.sign(diff) * maxStep);
}
