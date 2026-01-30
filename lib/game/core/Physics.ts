export interface Vector2 {
  x: number;
  y: number;
}

export const PhysicsConfig = {
  // SERVER / PHYSICS (The Truth)
  BASE_SPEED: 240, // Optimal speed for smooth movement
  BOOST_SPEED: 480, // 2x boost
  TURN_SPEED: Math.PI * 1.8, // Much tighter turning (Worms Zone agile feel)
  SEGMENT_DISTANCE: 14, // Better spacing for smooth movement
  SEGMENT_LERP_MIN: 0.15, // Smoother head movement
  SEGMENT_LERP_MAX: 0.25, // Looser tail for better flow
  COLLISION_RADIUS: 10, // Chunky hitbox
  INTERPOLATION_DELAY: 150, // ms
  MAP_SIZE: 6000, // Large world
  FOOD_RADIUS: 10,
  FOOD_VALUE: 1,
  AOI_RADIUS: 800,
};

export let VisualConfig = {
  // CLIENT / VISUAL (The Look)
  // Base render radius that scales with viewport
  BASE_RENDER_RADIUS: 30, // Base size for reference
  RENDER_RADIUS: 30, // Will be calculated dynamically based on viewport
  TAIL_TAPER_START: 0.9, // Taper only last 10% (Worms Zone style)
  TAIL_MIN_SCALE: 0.5, // Tip is 50% size
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

// Shortest angle difference
export function angleDifference(current: number, target: number): number {
  let diff = target - current;
  while (diff < -Math.PI) diff += Math.PI * 2;
  while (diff > Math.PI) diff -= Math.PI * 2;
  return diff;
}
