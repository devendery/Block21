// server/src/Physics.ts
import type { Vector2 } from "../../shared/types/Vector2";
import { PHYSICS_CONSTANTS } from "../../shared/types/PhysicsConstants";

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

  // ⚠️ NEW: Performance optimizations
  PHYSICS_TICK_RATE: 30, // Run physics at 30Hz instead of 60Hz
  MAX_PHYSICS_DT: 0.1, // Cap delta time to prevent spiral of death
  COLLISION_GRID_SIZE: 500, // Spatial grid cell size
  SEGMENT_COLLISION_SAMPLE_RATE: 0.25, // Only check 25% of segments for long snakes
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

  // ⚠️ NEW: Performance optimizations
  MAX_SEGMENTS_PER_SNAKE: 2000, // Limit segment count for rendering
  MIN_SEGMENT_DISTANCE: 15, // Don't render segments too close together
};

// ⚠️ OPTIMIZATION: Cached radius calculations
const RADIUS_CACHE = new Map<number, number>();
const MAX_CACHE_SIZE = 10000;

// ⚠️ OPTIMIZATION: Fast collision check without sqrt when possible
export function checkCircleCollision(x1: number, y1: number, r1: number, x2: number, y2: number, r2: number): boolean {
  const dx = x1 - x2;
  const dy = y1 - y2;
  const distSq = dx * dx + dy * dy;
  const radSum = r1 + r2;
  return distSq < radSum * radSum;
}

// ⚠️ OPTIMIZATION: Pre-calculated distance squared
export function distanceSquared(a: Vector2, b: Vector2): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return dx * dx + dy * dy;
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

const TAU = Math.PI * 2;

function wrapAngle0ToTau(angle: number): number {
  return ((angle % TAU) + TAU) % TAU;
}

export function wrapAngle(angle: number): number {
  let normalized = wrapAngle0ToTau(angle);
  if (normalized >= Math.PI) normalized -= TAU;
  return normalized;
}

export function angleDifference(current: number, target: number): number {
  const a = wrapAngle0ToTau(current);
  const b = wrapAngle0ToTau(target);
  const rawDiff = b - a;
  const diffWrapped = ((rawDiff + Math.PI) % TAU + TAU) % TAU - Math.PI;
  if (diffWrapped < -Math.PI) return diffWrapped + TAU;
  if (diffWrapped >= Math.PI) return diffWrapped - TAU;
  return diffWrapped;
}

// ⚠️ OPTIMIZATION: Cached radius calculation
export function calculateSnakeRadius(mass: number): number {
  // Check cache first
  const cacheKey = Math.floor(mass * 100); // Cache with 0.01 precision
  if (RADIUS_CACHE.has(cacheKey)) {
    return RADIUS_CACHE.get(cacheKey)!;
  }
  
  const { BASE_RADIUS, MAX_RADIUS, RADIUS_SCALE_FACTOR } = PhysicsConfig;
  const scaledRadius = BASE_RADIUS + mass * RADIUS_SCALE_FACTOR;
  const result = Math.min(MAX_RADIUS, Math.max(BASE_RADIUS, scaledRadius));
  
  // Cache result
  if (RADIUS_CACHE.size >= MAX_CACHE_SIZE) {
    // Remove oldest entry (Map maintains insertion order)
    const firstKey = RADIUS_CACHE.keys().next().value;
    if (firstKey !== undefined) {
      RADIUS_CACHE.delete(firstKey);
    }
  }
  RADIUS_CACHE.set(cacheKey, result);
  
  return result;
}

// Clear radius cache (call when physics constants change)
export function clearRadiusCache(): void {
  RADIUS_CACHE.clear();
}

// Calculate LOD level based on distance
export function calculateLODLevel(distance: number, segmentCount: number): number {
  const { LOD_DISTANCE_NEAR, LOD_DISTANCE_MEDIUM, LOD_DISTANCE_FAR } = VisualConfig;
  
  if (distance < LOD_DISTANCE_NEAR) return 0; 
  if (distance < LOD_DISTANCE_MEDIUM) {
    if (segmentCount > 1000) return 2;
    if (segmentCount > 500) return 1;
    return 0;
  }
  if (distance < LOD_DISTANCE_FAR) {
    if (segmentCount > 500) return 3;
    if (segmentCount > 200) return 2;
    return 1;
  }
  return segmentCount > 100 ? 4 : 3;
}

// Boost Mass Drain Calculation
export function calculateBoostDrain(boostTimeSeconds: number): number {
  const { BOOST_DRAIN_RATE } = PhysicsConfig;
  return Math.floor(boostTimeSeconds * BOOST_DRAIN_RATE);
}

// ⚠️ OPTIMIZATION: Fast rotate towards
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

// === NEW: BVH (Bounding Volume Hierarchy) Utilities ===
export interface BoundingCircle {
  x: number;
  y: number;
  radius: number;
  entityId: string;
}

export interface BVHNode {
  bounds: BoundingCircle;
  children: BVHNode[];
  entities: string[];
  isLeaf: boolean;
}

// ⚠️ OPTIMIZATION: Fast AABB check with early exits
export function aabbOverlap(
  ax1: number, ay1: number, ax2: number, ay2: number,
  bx1: number, by1: number, bx2: number, by2: number
): boolean {
  return !(ax2 < bx1 || ax1 > bx2 || ay2 < by1 || ay1 > by2);
}

// ⚠️ OPTIMIZATION: Circle to AABB with squared distance
export function circleAABBCollision(
  cx: number, cy: number, radius: number,
  minX: number, minY: number, maxX: number, maxY: number
): boolean {
  const closestX = clamp(cx, minX, maxX);
  const closestY = clamp(cy, minY, maxY);
  const dx = cx - closestX;
  const dy = cy - closestY;
  return (dx * dx + dy * dy) < (radius * radius);
}

// Calculate snake bounding circle (optimized)
export function calculateSnakeBoundingCircle(
  headX: number, headY: number, 
  segmentCount: number, 
  segmentRadius: number
): BoundingCircle {
  // Long snakes have larger bounding radius
  const lengthFactor = Math.min(1, segmentCount / 1000);
  const radius = segmentRadius * (1 + lengthFactor * 2);
  
  return {
    x: headX,
    y: headY,
    radius: radius,
    entityId: ''
  };
}

// ⚠️ OPTIMIZATION: Fast bounding circle calculation
export function calculateSnakeBoundingCircleFast(
  headX: number, headY: number, 
  segmentCount: number, 
  segmentRadius: number
): BoundingCircle {
  // Approximate radius based on snake length
  const effectiveLength = Math.min(segmentCount, 1000);
  const lengthFactor = effectiveLength / 1000;
  
  // Snake gets longer but not infinitely wider
  const radius = segmentRadius * (1 + lengthFactor * 1.5);
  
  return {
    x: headX,
    y: headY,
    radius: radius,
    entityId: ''
  };
}

// ⚠️ NEW: Spatial grid utilities for collision optimization
export class SpatialGrid {
  private cellSize: number;
  private cells: Map<string, Set<string>>;
  
  constructor(cellSize: number = PhysicsConfig.COLLISION_GRID_SIZE) {
    this.cellSize = cellSize;
    this.cells = new Map();
  }
  
  clear(): void {
    this.cells.clear();
  }
  
  private getCellKey(x: number, y: number): string {
    const cellX = Math.floor(x / this.cellSize);
    const cellY = Math.floor(y / this.cellSize);
    return `${cellX},${cellY}`;
  }
  
  insert(id: string, x: number, y: number): void {
    const key = this.getCellKey(x, y);
    if (!this.cells.has(key)) {
      this.cells.set(key, new Set());
    }
    this.cells.get(key)!.add(id);
  }
  
  remove(id: string, x: number, y: number): void {
    const key = this.getCellKey(x, y);
    const cell = this.cells.get(key);
    if (cell) {
      cell.delete(id);
      if (cell.size === 0) {
        this.cells.delete(key);
      }
    }
  }
  
  query(x: number, y: number, radius: number): Set<string> {
    const result = new Set<string>();
    const minX = Math.floor((x - radius) / this.cellSize);
    const maxX = Math.floor((x + radius) / this.cellSize);
    const minY = Math.floor((y - radius) / this.cellSize);
    const maxY = Math.floor((y + radius) / this.cellSize);
    
    for (let cellX = minX; cellX <= maxX; cellX++) {
      for (let cellY = minY; cellY <= maxY; cellY++) {
        const key = `${cellX},${cellY}`;
        const cell = this.cells.get(key);
        if (cell) {
          cell.forEach(id => result.add(id));
        }
      }
    }
    
    return result;
  }
}

// ⚠️ NEW: Frame rate limiter for physics
export class PhysicsFrameLimiter {
  private lastPhysicsTime: number = 0;
  private readonly physicsInterval: number = 1000 / PhysicsConfig.PHYSICS_TICK_RATE;
  private accumulatedTime: number = 0;
  private maxAccumulatedTime: number = PhysicsConfig.MAX_PHYSICS_DT * 1000;
  
  shouldUpdate(currentTime: number): boolean {
    const delta = currentTime - this.lastPhysicsTime;
    
    if (delta >= this.physicsInterval) {
      this.lastPhysicsTime = currentTime - (delta % this.physicsInterval);
      return true;
    }
    
    return false;
  }
  
  // Fixed timestep with accumulation
  shouldUpdateFixed(currentTime: number): { shouldUpdate: boolean; dt: number } {
    const delta = currentTime - this.lastPhysicsTime;
    this.accumulatedTime += delta;
    this.lastPhysicsTime = currentTime;
    
    // Cap accumulated time to prevent spiral of death
    if (this.accumulatedTime > this.maxAccumulatedTime) {
      this.accumulatedTime = this.maxAccumulatedTime;
    }
    
    if (this.accumulatedTime >= this.physicsInterval) {
      const dt = this.physicsInterval / 1000;
      this.accumulatedTime -= this.physicsInterval;
      return { shouldUpdate: true, dt };
    }
    
    return { shouldUpdate: false, dt: 0 };
  }
  
  reset(): void {
    this.lastPhysicsTime = performance.now();
    this.accumulatedTime = 0;
  }
}

// ⚠️ NEW: Optimized segment sampling for long snakes
export function getSampledSegments(totalSegments: number): number[] {
  const sampleRate = PhysicsConfig.SEGMENT_COLLISION_SAMPLE_RATE;
  const maxSamples = Math.ceil(totalSegments * sampleRate);
  
  if (totalSegments <= 50) {
    // Small snakes: check all segments
    return Array.from({ length: totalSegments }, (_, i) => i);
  }
  
  // Large snakes: sample strategically
  const indices: number[] = [];
  
  // Always include head
  indices.push(0);
  
  // Sample body segments
  const step = Math.max(1, Math.floor(totalSegments / maxSamples));
  for (let i = step; i < totalSegments - 1; i += step) {
    indices.push(i);
  }
  
  // Always include tail
  if (totalSegments > 1) {
    indices.push(totalSegments - 1);
  }
  
  return indices;
}

// ⚠️ NEW: Fast vector operations
export function vectorLengthSquared(v: Vector2): number {
  return v.x * v.x + v.y * v.y;
}

export function vectorLength(v: Vector2): number {
  return Math.sqrt(vectorLengthSquared(v));
}

export function vectorAdd(a: Vector2, b: Vector2): Vector2 {
  return { x: a.x + b.x, y: a.y + b.y };
}

export function vectorSubtract(a: Vector2, b: Vector2): Vector2 {
  return { x: a.x - b.x, y: a.y - b.y };
}

export function vectorScale(v: Vector2, scalar: number): Vector2 {
  return { x: v.x * scalar, y: v.y * scalar };
}

export function vectorDot(a: Vector2, b: Vector2): number {
  return a.x * b.x + a.y * b.y;
}

// Performance monitoring
export function getPhysicsStats(): any {
  return {
    radiusCacheSize: RADIUS_CACHE.size,
    radiusCacheHitRate: RADIUS_CACHE.size > 0 ? 
      (RADIUS_CACHE.size / (RADIUS_CACHE.size + 1000)) : 0,
    physicsTickRate: PhysicsConfig.PHYSICS_TICK_RATE,
    maxSegmentsPerSnake: VisualConfig.MAX_SEGMENTS_PER_SNAKE
  };
}
