// server/src/Physics.ts
import type { Vector2 } from "../../../shared/types/Vector2";
import { PHYSICS_CONSTANTS } from "../../../shared/types/PhysicsConstants";

export type { Vector2 };

export const PhysicsConfig = {
  // SERVER / PHYSICS (The Truth) - Worms Zone Physics
  BASE_SPEED: PHYSICS_CONSTANTS.BASE_SPEED, // 1.3 units/frame at 60 FPS = 78 units/second (Worms Zone)
  BOOST_SPEED: PHYSICS_CONSTANTS.BOOST_SPEED, // 2.5x base speed = 195 units/second (3.25 units/frame)
  TURN_SPEED: PHYSICS_CONSTANTS.TURN_SPEED_DEGREES * (Math.PI / 180) * 60, // Convert to rad/sec
  SEGMENT_DISTANCE: PHYSICS_CONSTANTS.SEGMENT_DISTANCE, // Better spacing for smooth movement
  SEGMENT_LERP_MIN: PHYSICS_CONSTANTS.SEGMENT_LERP_MIN, // Smoother head movement
  SEGMENT_LERP_MAX: PHYSICS_CONSTANTS.SEGMENT_LERP_MAX, // Looser tail for better flow
  COLLISION_RADIUS: PHYSICS_CONSTANTS.COLLISION_RADIUS, // Chunky hitbox
  INTERPOLATION_DELAY: PHYSICS_CONSTANTS.INTERPOLATION_DELAY, // ms
  
  // INFINITE MAP: Remove fixed boundaries
  // REMOVED: MAP_SIZE: 6000, // Large world
  
  // INFINITE WORLD SYSTEM
  CHUNK_SIZE: PHYSICS_CONSTANTS.CHUNK_SIZE, // World divided into 10k x 10k chunks
  RENDER_DISTANCE: PHYSICS_CONSTANTS.RENDER_DISTANCE, // Players only see within 1500 units
  UNIVERSE_LIMIT: PHYSICS_CONSTANTS.UNIVERSE_LIMIT, // Soft limit for floating point precision
  
  BASE_TURN_SPEED: PHYSICS_CONSTANTS.BASE_TURN_SPEED, // Faster turning (was 1.5)
  BASE_RADIUS: PHYSICS_CONSTANTS.BASE_RADIUS, // Starting visual radius (matches Worms Zone)
  MAX_RADIUS: PHYSICS_CONSTANTS.MAX_RADIUS,
  FOOD_RADIUS: PHYSICS_CONSTANTS.FOOD_RADIUS,
  FOOD_VALUE: PHYSICS_CONSTANTS.FOOD_VALUE,
  AOI_RADIUS: PHYSICS_CONSTANTS.AOI_RADIUS, // Area of Interest for network updates
  
  // Worms Zone Radius Scaling Formula
  RADIUS_BASE: PHYSICS_CONSTANTS.BASE_RADIUS, // Base radius: 4px
  RADIUS_MAX: PHYSICS_CONSTANTS.MAX_RADIUS, // Max radius: 10px
  RADIUS_SCALE_FACTOR: PHYSICS_CONSTANTS.RADIUS_SCALE_FACTOR,
  RADIUS_CAP_SEGMENTS: PHYSICS_CONSTANTS.RADIUS_CAP_SEGMENTS,
  
  // Boost Mass Drain Rate
  BOOST_DRAIN_RATE: PHYSICS_CONSTANTS.BOOST_DRAIN_RATE,
  BOOST_DRAIN_FRAMES: PHYSICS_CONSTANTS.BOOST_DRAIN_FRAMES,
};

export const VisualConfig = {
  // CLIENT / VISUAL (The Look)
  RENDER_RADIUS: PHYSICS_CONSTANTS.RENDER_RADIUS, // Chunky visuals (bigger than hitbox) - WILL BE OVERRIDDEN
  TAIL_TAPER_START: PHYSICS_CONSTANTS.TAIL_TAPER_START, // Taper only last 10% (Worms Zone style)
  TAIL_MIN_SCALE: PHYSICS_CONSTANTS.TAIL_MIN_SCALE, // Tip is 50% size
  GLOW_ALPHA: 0.3,
  SHADOW_ALPHA: 0.4,
  
  // LOD SETTINGS FOR UNLIMITED SNAKES
  LOD_DISTANCE_NEAR: PHYSICS_CONSTANTS.LOD_DISTANCE_NEAR,    // Full detail
  LOD_DISTANCE_MEDIUM: PHYSICS_CONSTANTS.LOD_DISTANCE_MEDIUM, // Medium detail
  LOD_DISTANCE_FAR: PHYSICS_CONSTANTS.LOD_DISTANCE_FAR,    // Low detail
  LOD_DISTANCE_VISIBLE: PHYSICS_CONSTANTS.LOD_DISTANCE_VISIBLE, // Maximum visible distance
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

// Worms Zone Radius Scaling Formula
export function calculateSnakeRadius(mass: number): number {
  const { BASE_RADIUS, MAX_RADIUS, RADIUS_SCALE_FACTOR } = PhysicsConfig;
  const scaledRadius = BASE_RADIUS + mass * RADIUS_SCALE_FACTOR;
  return Math.min(MAX_RADIUS, Math.max(BASE_RADIUS, scaledRadius));
}

// Calculate LOD level based on distance
export function calculateLODLevel(distance: number, segmentCount: number): number {
  const { LOD_DISTANCE_NEAR, LOD_DISTANCE_MEDIUM, LOD_DISTANCE_FAR } = VisualConfig;
  
  if (distance < LOD_DISTANCE_NEAR) return 0; // Full detail
  if (distance < LOD_DISTANCE_MEDIUM) return 1; // Medium detail
  if (distance < LOD_DISTANCE_FAR) return 2; // Low detail
  return 3; // Very low detail (or invisible)
}

// Boost Mass Drain Calculation
export function calculateBoostDrain(boostTimeSeconds: number): number {
  const { BOOST_DRAIN_RATE } = PhysicsConfig;
  // Returns number of segments to drain based on boost duration
  return Math.floor(boostTimeSeconds * BOOST_DRAIN_RATE);
}

export function rotateTowards(current: number, target: number, maxStep: number): number {
  const diff = angleDifference(current, target);
  if (Math.abs(diff) < maxStep) return target;
  return wrapAngle(current + Math.sign(diff) * maxStep);
}

// Check if position is within render distance
export function isWithinRenderDistance(x1: number, y1: number, x2: number, y2: number): boolean {
  const dx = x1 - x2;
  const dy = y1 - y2;
  return (dx * dx + dy * dy) <= (VisualConfig.LOD_DISTANCE_VISIBLE * VisualConfig.LOD_DISTANCE_VISIBLE);
}
