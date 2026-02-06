// server/src/index.ts - OPTIMIZED VERSION
import http from "http";
import express from "express";
import cors from "cors";
import { Server, Room, Client } from "colyseus";
import { StateView, Encoder } from "@colyseus/schema";
import { performance } from "perf_hooks";
import { GameState, Player, SnakeSegment, Food } from "./State";
import { SnakeLogic } from "./Snake";
import { AISnakeController } from "./AISnakeController";
import { PhysicsConfig, checkCircleCollision, calculateSnakeRadius } from "./Physics";
import { CollisionSystem } from "./CollisionSystem";
import { PersistenceSystem } from "./PersistenceSystem";
import { FoodSystem } from "./FoodSystem";
import { runECSTick } from "../../lib/ecs/ECSOrchestrator";
import { resetWorld } from "../../lib/game/core/World";
import { syncLegacySnakes } from "../../lib/ecs/SyncSystem";
import { SERVER_CONSTANTS } from "./ServerConstants";

Encoder.BUFFER_SIZE = SERVER_CONSTANTS.ENCODER_BUFFER_SIZE;

const PERF_SAMPLE_LIMIT = 100;
const PERF_LOG_INTERVAL_MS = 5000;

const humanPhysicsTimes: number[] = [];
const aiPhysicsTimes: number[] = [];
const ecsTimes: number[] = [];
const collisionTimes: number[] = [];
const aoiTimes: number[] = [];
const gridTimes: number[] = [];

let lastSectionPerfLogMs = 0;

function pushSample(samples: number[], valueMs: number): void {
  samples.push(valueMs);
  if (samples.length > PERF_SAMPLE_LIMIT) samples.shift();
}

function average(samples: number[]): number {
  if (samples.length === 0) return 0;
  let sum = 0;
  for (let i = 0; i < samples.length; i++) sum += samples[i];
  return sum / samples.length;
}

function maybeLogSectionPerf(nowMs: number): void {
  if (lastSectionPerfLogMs === 0) lastSectionPerfLogMs = nowMs;
  if (nowMs - lastSectionPerfLogMs < PERF_LOG_INTERVAL_MS) return;

  const humanAvg = average(humanPhysicsTimes);
  const aiAvg = average(aiPhysicsTimes);
  const ecsAvg = average(ecsTimes);
  const collisionAvg = average(collisionTimes);
  const aoiAvg = average(aoiTimes);
  const gridAvg = average(gridTimes);

  console.log(
    `[CPU] physics(human): ${humanAvg.toFixed(2)}ms | physics(ai): ${aiAvg.toFixed(2)}ms | ecs: ${ecsAvg.toFixed(2)}ms | collision: ${collisionAvg.toFixed(2)}ms | aoi: ${aoiAvg.toFixed(2)}ms | grid: ${gridAvg.toFixed(2)}ms (${gridTimes.length})`
  );

  humanPhysicsTimes.length = 0;
  aiPhysicsTimes.length = 0;
  ecsTimes.length = 0;
  collisionTimes.length = 0;
  aoiTimes.length = 0;
  gridTimes.length = 0;
  lastSectionPerfLogMs = nowMs;
}

class SpatialGrid {
  private cellSize: number;
  private cells: Map<number, string[]> = new Map();
  private entityLoc: Map<string, { key: number; index: number }> = new Map();
  private queryResult: string[] = [];

  constructor(cellSize: number) {
    this.cellSize = cellSize;
  }

  clear() {
    this.cells.clear();
    this.entityLoc.clear();
  }

  private cellKeyFromCoords(cx: number, cy: number): number {
    return (cx << 16) ^ (cy & 0xffff);
  }

  private cellCoords(x: number, y: number): { cx: number; cy: number } {
    return {
      cx: Math.floor(x / this.cellSize),
      cy: Math.floor(y / this.cellSize),
    };
  }

  upsert(id: string, x: number, y: number) {
    const { cx, cy } = this.cellCoords(x, y);
    const newKey = this.cellKeyFromCoords(cx, cy);
    const current = this.entityLoc.get(id);

    if (current && current.key === newKey) {
      return;
    }

    if (current) {
      const oldCell = this.cells.get(current.key);
      if (oldCell) {
        const index = current.index;
        if (index < oldCell.length - 1) {
          oldCell[index] = oldCell[oldCell.length - 1];
          const swappedId = oldCell[index];
          const swappedLoc = this.entityLoc.get(swappedId);
          if (swappedLoc) swappedLoc.index = index;
        }
        oldCell.pop();
        if (oldCell.length === 0) {
          this.cells.delete(current.key);
        }
      }
    }

    let cell = this.cells.get(newKey);
    if (!cell) {
      cell = [];
      this.cells.set(newKey, cell);
    }
    const newIndex = cell.length;
    cell.push(id);
    this.entityLoc.set(id, { key: newKey, index: newIndex });
  }

  remove(id: string) {
    const loc = this.entityLoc.get(id);
    if (!loc) return;

    const cell = this.cells.get(loc.key);
    if (cell) {
      const index = loc.index;
      if (index < cell.length - 1) {
        cell[index] = cell[cell.length - 1];
        const swappedId = cell[index];
        const swappedLoc = this.entityLoc.get(swappedId);
        if (swappedLoc) swappedLoc.index = index;
      }
      cell.pop();
      if (cell.length === 0) {
        this.cells.delete(loc.key);
      }
    }
    this.entityLoc.delete(id);
  }

  query(x: number, y: number, radius: number): string[] {
    this.queryResult.length = 0;

    const { cx: centerCx, cy: centerCy } = this.cellCoords(x, y);
    const radiusCells = Math.ceil(radius / this.cellSize);

    for (let dx = -radiusCells; dx <= radiusCells; dx++) {
      for (let dy = -radiusCells; dy <= radiusCells; dy++) {
        const key = this.cellKeyFromCoords(centerCx + dx, centerCy + dy);
        const cell = this.cells.get(key);
        if (!cell) continue;
        for (let i = 0; i < cell.length; i++) {
          this.queryResult.push(cell[i]);
        }
      }
    }

    return this.queryResult;
  }
}

class Block21Room extends Room<GameState> {
  // Game Loop
  snakes: Map<string, SnakeLogic> = new Map();
  private aiSnakes: Map<string, AISnakeController> = new Map();
  private collisionSystem!: CollisionSystem;
  private persistenceSystem!: PersistenceSystem;
  private clientViews: Map<string, StateView> = new Map();
  private clientAOI: Map<string, { players: Set<string>; food: Map<string, Food> }> = new Map();
  private playersGrid = new SpatialGrid(PhysicsConfig.AOI_RADIUS);
  private foodGrid = new SpatialGrid(PhysicsConfig.AOI_RADIUS);
  private tickCounter = 0;
  private readonly GRID_REBUILD_EVERY = SERVER_CONSTANTS.GRID_REBUILD_EVERY;
  private arenaTier = 1;
  private arenaRadius: number = SERVER_CONSTANTS.ARENA_TIER_RADII[1];

  // ⚠️ CRITICAL FIX: Load balancing and frame skipping
  private lastTickTime = 0;
  private readonly tickBudgetMs = 1000 / SERVER_CONSTANTS.TICK_RATE;
  private slowFrameCounter = 0;
  private skipAITick = false;
  private performanceStats = {
    frameTimes: [] as number[],
    lastStatLog: 0,
    avgFrameTime: 0
  };

  // ⚠️ OPTIMIZATION: Batch processing
  private aiUpdateQueue: string[] = [];
  private aiUpdateIndex = 0;
  private aiBatchSize = 3; // Update 3 AI snakes per frame
  private aoiUpdateCursor = 0;
  private foodSystem = new FoodSystem();
  private scratchPlayers = new Set<string>();
  private scratchFood = new Map<string, Food>();
  private lastAoiUpdateMs = new Map<string, number>();
  private lastAoiCenter = new Map<string, { x: number; y: number }>();
  private readonly AOI_UPDATE_TIERS = {
    HIGH: 33,
    NORMAL: 100,
    LOW: 200
  };

  getArenaRadius() {
    return this.arenaRadius;
  }

  getArenaCenter() {
    return { x: 0, y: 0 };
  }

  getArenaTier() {
    return this.arenaTier;
  }

  private getAoiRadius(me: import("../../shared/schemas/GameState").Player) {
    const len = me.length || 0;
    const progress = Math.max(0, Math.min(1, len / SERVER_CONSTANTS.AOI_LENGTH_NORMALIZATION));
    const base = PhysicsConfig.AOI_RADIUS;
    const max = PhysicsConfig.AOI_RADIUS * 2;
    return base + (max - base) * Math.sqrt(progress);
  }

  onCreate(options: any) {
    console.log("Block21 Room Created! (OPTIMIZED VERSION)");
    resetWorld();
    this.setState(new GameState());
    
    this.collisionSystem = new CollisionSystem(this.state, {
      onFoodAdded: (foodId, food) => {
        this.foodGrid.upsert(foodId, food.x, food.y);
      },
      onFoodRemoved: (foodId) => {
        this.foodGrid.remove(foodId);
      }
    });
    this.persistenceSystem = new PersistenceSystem();

    this.onMessage("input", (client, input) => {
      const snake = this.snakes.get(client.sessionId);
      if (!snake) return;
      snake.lastInput = input;
    });

    // ⚠️ OPTIMIZATION: Use fixed time step with catch-up
    this.setSimulationInterval(
      (deltaTime) => this.update(deltaTime),
      1000 / SERVER_CONSTANTS.TICK_RATE
    );

    const arena = this.computeArena();
    this.arenaTier = arena.tier;
    this.arenaRadius = arena.radius;
    this.spawnFood(this.getTargetFoodCount());
  }

  onJoin(client: Client, options: any) {
    console.log(client.sessionId, "joined!");
    
    const player = new Player();
    player.id = client.sessionId;
    
    const spawn = this.randomPointInArena(this.arenaRadius * 0.85);
    player.x = spawn.x;
    player.y = spawn.y;
    player.angle = Math.PI / 2;
    player.name = options.name || "Anonymous";
    player.radius = PhysicsConfig.BASE_RADIUS;
    player.skin = Math.floor(Math.random() * SERVER_CONSTANTS.SKIN_COUNT);
    
    this.state.players.set(client.sessionId, player);
    this.playersGrid.upsert(client.sessionId, player.x, player.y);

    const snakeLogic = new SnakeLogic(player, this);
    snakeLogic.initSegments();
    this.snakes.set(client.sessionId, snakeLogic);
    this.collisionSystem.registerSnakeLogic(client.sessionId, snakeLogic);

    const view = new StateView();
    (client as any).view = view;
    this.clientViews.set(client.sessionId, view);
    this.clientAOI.set(client.sessionId, { 
      players: new Set([client.sessionId]), 
      food: new Map<string, Food>() 
    });
    
    view.add(player);

    const savedData = this.persistenceSystem.loadPlayer(client.sessionId);
    if (savedData) {
      console.log(`Loaded saved data for ${player.name}: highScore=${savedData.highScore}`);
    }

    client.send("welcome", {
      message: "Welcome to Worms Zone Arena! (Optimized)",
      features: ["optimized_performance", "dynamic_load_balancing"]
    });

    this.spawnAISnakes(player);
  }

  onLeave(client: Client, consented: boolean) {
    console.log(client.sessionId, "left!");
    
    const player = this.state.players.get(client.sessionId);
    if (player) {
      this.persistenceSystem.savePlayer(player);
      this.convertSnakeToFood(client.sessionId);
    }
    
    this.collisionSystem.unregisterSnakeLogic(client.sessionId);
    this.playersGrid.remove(client.sessionId);
    this.state.players.delete(client.sessionId);
    this.snakes.delete(client.sessionId);
    this.clientViews.delete(client.sessionId);
    this.clientAOI.delete(client.sessionId);
    
    this.removeAllAISnakes();
  }

  onDispose() {
    console.log("room disposed");
    
    this.state.players.forEach(player => {
      this.persistenceSystem.savePlayer(player);
    });
    
    this.persistenceSystem.shutdown();
  }

  // ⚠️ CRITICAL FIX: Optimized update with load balancing
  update(deltaTime: number) {
    const frameStart = performance.now();
    
    // Skip frame if server is overloaded
    if (frameStart - this.lastTickTime < this.tickBudgetMs) {
      return;
    }
    
    // Cap deltaTime to prevent spiral of death
    const dt = Math.min(deltaTime / 1000, 0.1);
    this.tickCounter++;
    
    const arena = this.computeArena();
    this.arenaTier = arena.tier;
    this.arenaRadius = arena.radius;

    // Update human players
    const humanUpdateStart = performance.now();
    this.snakes.forEach((snake, sessionId) => {
      if (this.aiSnakes.has(sessionId)) return;
      if (!snake.player.alive) return;

      const input = snake.lastInput ?? {
        vector: snake.getDirectionVector(),
        boost: false
      };

      snake.update(dt, input);
      this.playersGrid.upsert(sessionId, snake.player.x, snake.player.y);
      
      const seq = (input as any).seq;
      if (typeof seq === "number") {
        snake.player.lastAckInputSeq = seq;
      }
    });
    const humanUpdateTime = performance.now() - humanUpdateStart;
    pushSample(humanPhysicsTimes, humanUpdateTime);

    // Dynamic AI update skipping based on load
    const budgetUsed = humanUpdateTime / this.tickBudgetMs;
    this.skipAITick = budgetUsed > 0.7 || this.slowFrameCounter > 3;

    let aiUpdateTime = 0;
    if (!this.skipAITick) {
      const aiUpdateStart = performance.now();
      
      // ⚠️ OPTIMIZATION: Batch AI updates
      if (this.aiUpdateQueue.length !== this.aiSnakes.size) {
        this.aiUpdateQueue = Array.from(this.aiSnakes.keys());
        this.aiUpdateIndex = 0;
      }
      
      const MAX_AI_PER_FRAME = 5;
      const batchSize = Math.min(MAX_AI_PER_FRAME, this.aiUpdateQueue.length);
      for (let i = 0; i < batchSize; i++) {
        const aiId = this.aiUpdateQueue[this.aiUpdateIndex];
        this.aiUpdateIndex = (this.aiUpdateIndex + 1) % this.aiUpdateQueue.length;
        
        const aiController = this.aiSnakes.get(aiId);
        const snake = this.snakes.get(aiId);
        
        if (!aiController || !snake || !snake.player.alive) continue;
        
        const aiInput = aiController.update(dt);
        snake.update(dt, aiInput);
        this.playersGrid.upsert(aiId, snake.player.x, snake.player.y);
      }
      
      aiUpdateTime = performance.now() - aiUpdateStart;
      pushSample(aiPhysicsTimes, aiUpdateTime);
      
      // Adjust batch size based on performance
      if (aiUpdateTime > this.tickBudgetMs * 0.2) {
        this.aiBatchSize = Math.max(1, this.aiBatchSize - 1);
      } else if (aiUpdateTime < this.tickBudgetMs * 0.05) {
        this.aiBatchSize = Math.min(5, this.aiBatchSize + 1);
      }
    }

    // Periodic AI repositioning (less frequent)
    if (!this.skipAITick && this.tickCounter % 180 === 0) { // Every 6 seconds at 30Hz
      this.keepAISnakesNearHumans();
    }

    // ECS update
    const ecsStart = performance.now();
    runECSTick();
    const ecsTime = performance.now() - ecsStart;
    pushSample(ecsTimes, ecsTime);
    syncLegacySnakes(Array.from(this.snakes.values()));
    
    const collisionStart = performance.now();
    this.collisionSystem.update();
    const collisionTime = performance.now() - collisionStart;
    pushSample(collisionTimes, collisionTime);

    // ⚠️ OPTIMIZATION: Staggered AOI updates
    const aoiUpdateStart = performance.now();
    const clientCount = this.clients.length;
    const maxUpdates = this.skipAITick ? 3 : 5;
    const now = performance.now();
    
    let clientsUpdated = 0;
    for (let i = 0; i < clientCount && clientsUpdated < maxUpdates; i++) {
      const clientIndex = (this.aoiUpdateCursor + i) % clientCount;
      const client = this.clients[clientIndex];

      const myId = client.sessionId;
      const me = this.state.players.get(myId);
      const view = this.clientViews.get(myId);
      const aoi = this.clientAOI.get(myId);
      
      if (!me || !view || !aoi) continue;

      const lastUpdate = this.lastAoiUpdateMs.get(myId) || 0;
      const updateInterval = this.skipAITick ? this.AOI_UPDATE_TIERS.LOW : this.AOI_UPDATE_TIERS.NORMAL;
      if (now - lastUpdate < updateInterval) continue;
      
      this.updateClientAOI(myId, me, view, aoi);
      clientsUpdated++;
    }
    this.aoiUpdateCursor = (this.aoiUpdateCursor + Math.max(1, clientsUpdated)) % Math.max(1, clientCount);
    const aoiTime = performance.now() - aoiUpdateStart;
    pushSample(aoiTimes, aoiTime);

    // Food spawning with budget check
    const targetFoodCount = this.getTargetFoodCount();
    if (this.state.food.size < targetFoodCount && !this.skipAITick) {
      const spawnCount = Math.min(
        SERVER_CONSTANTS.FOOD_SPAWN_MAX_PER_TICK,
        targetFoodCount - this.state.food.size
      );
      
      if (spawnCount > 0) {
        this.spawnFood(spawnCount);
      }
    }

    const frameEnd = performance.now();
    const frameTime = frameEnd - frameStart;
    
    // Performance monitoring
    this.performanceStats.frameTimes.push(frameTime);
    if (this.performanceStats.frameTimes.length > 100) {
      this.performanceStats.frameTimes.shift();
    }
    
    if (frameEnd - this.performanceStats.lastStatLog > 10000) { // Log every 10 seconds
      const avg = this.performanceStats.frameTimes.reduce((a, b) => a + b, 0) / 
                 this.performanceStats.frameTimes.length;
      console.log(`[PERF] Avg frame: ${avg.toFixed(2)}ms, Clients: ${clientCount}, AI: ${this.aiSnakes.size}`);
      this.performanceStats.lastStatLog = frameEnd;
    }

    maybeLogSectionPerf(frameEnd);

    // Load balancing decisions
    if (frameTime > this.tickBudgetMs * 1.2) {
      this.slowFrameCounter++;
      if (this.slowFrameCounter > 5) {
        console.warn(`High load detected: ${frameTime.toFixed(2)}ms, reducing AI`);
        this.removeSomeAISnakes(Math.ceil(this.aiSnakes.size * 0.25));
      }
    } else if (frameTime < this.tickBudgetMs * 0.8) {
      this.slowFrameCounter = Math.max(0, this.slowFrameCounter - 1);
    }
    
    this.lastTickTime = frameStart;
  }

  // ⚠️ OPTIMIZATION: Dedicated AOI update method
  private updateClientAOI(myId: string, me: Player, view: StateView, aoi: { players: Set<string>; food: Map<string, Food> }) {
    if (this.skipAITick) return;

    const now = performance.now();
    const lastUpdate = this.lastAoiUpdateMs.get(myId) || 0;
    const lastCenter = this.lastAoiCenter.get(myId);

    let updateInterval = this.AOI_UPDATE_TIERS.NORMAL;
    if (this.slowFrameCounter > 3 || this.skipAITick) {
      updateInterval = this.AOI_UPDATE_TIERS.LOW;
    } else if ((me.length || 0) > 1000) {
      updateInterval = this.AOI_UPDATE_TIERS.HIGH;
    }

    let shouldUpdate = false;
    if (!lastCenter) {
      shouldUpdate = true;
    } else {
      const dx = me.x - lastCenter.x;
      const dy = me.y - lastCenter.y;
      const moveSq = dx * dx + dy * dy;
      shouldUpdate = moveSq > 14400 || (now - lastUpdate) >= updateInterval;
    }
    if (!shouldUpdate) return;

    const radius = this.getAoiRadius(me);
    const radiusSq = radius * radius;

    this.scratchPlayers.clear();
    this.scratchFood.clear();

    this.scratchPlayers.add(myId);

    const playerCandidates = this.playersGrid.query(me.x, me.y, radius);
    for (let i = 0; i < playerCandidates.length; i++) {
      const pid = playerCandidates[i];
      const p = this.state.players.get(pid);
      if (!p) continue;

      if (!p.alive) {
        this.scratchPlayers.add(pid);
        continue;
      }

      if (pid === myId) continue;

      const dx = p.x - me.x;
      const dy = p.y - me.y;
      if (dx * dx + dy * dy <= radiusSq) {
        this.scratchPlayers.add(pid);
      }
    }

    for (const pid of aoi.players) {
      if (this.scratchPlayers.has(pid)) continue;
      const p = this.state.players.get(pid);
      if (p) view.remove(p);
    }

    for (const pid of this.scratchPlayers) {
      if (aoi.players.has(pid)) continue;
      if (pid === myId) continue;
      const p = this.state.players.get(pid);
      if (p) view.add(p);
    }

    aoi.players.clear();
    for (const pid of this.scratchPlayers) {
      aoi.players.add(pid);
    }

    const foodAOIRadius = PhysicsConfig.AOI_RADIUS * SERVER_CONSTANTS.FOOD_AOI_SCALE;
    const foodRadiusSq = foodAOIRadius * foodAOIRadius;
    const foodCandidates = this.foodGrid.query(me.x, me.y, foodAOIRadius);

    for (let i = 0; i < foodCandidates.length; i++) {
      const fid = foodCandidates[i];
      const f = this.state.food.get(fid);
      if (!f) continue;
      const dx = f.x - me.x;
      const dy = f.y - me.y;
      if (dx * dx + dy * dy <= foodRadiusSq) {
        this.scratchFood.set(fid, f);
      }
    }

    for (const [fid, food] of aoi.food) {
      if (this.scratchFood.has(fid)) continue;
      view.remove(food);
    }

    for (const [fid, food] of this.scratchFood) {
      if (aoi.food.has(fid)) continue;
      view.add(food);
    }

    aoi.food.clear();
    for (const [fid, food] of this.scratchFood) {
      aoi.food.set(fid, food);
    }

    this.lastAoiUpdateMs.set(myId, now);
    this.lastAoiCenter.set(myId, { x: me.x, y: me.y });
  }

  private spawnFood(count: number = 1) {
    for (let i = 0; i < count; i++) {
      const p = this.randomPointInArenaWithCenterWeight();
      const food = this.foodSystem.createFood(p.x, p.y);

      const id = Math.random().toString(36).substr(2, SERVER_CONSTANTS.FOOD_ID_LENGTH);
      this.state.food.set(id, food);
      this.collisionSystem.addFoodToGrid(id, food);
    }
  }

  private computeArena(): { tier: number; radius: number } {
    let totalMass = 0;
    for (const p of this.state.players.values()) {
      if (!p.alive) continue;
      totalMass += p.mass ?? 0;
    }

    let tier = 4;
    if (totalMass < SERVER_CONSTANTS.ARENA_TIER1_MASS_MAX) tier = 1;
    else if (totalMass < SERVER_CONSTANTS.ARENA_TIER2_MASS_MAX) tier = 2;
    else if (totalMass < SERVER_CONSTANTS.ARENA_TIER3_MASS_MAX) tier = 3;

    const radius = SERVER_CONSTANTS.ARENA_TIER_RADII[tier] ?? SERVER_CONSTANTS.ARENA_TIER_RADII[1];
    return { tier, radius };
  }

  private getTargetFoodCount(): number {
    const area = Math.PI * this.arenaRadius * this.arenaRadius;
    const target = Math.floor(area * SERVER_CONSTANTS.FOOD_DENSITY);
    return Math.min(
      SERVER_CONSTANTS.ARENA_MAX_FOOD,
      Math.max(SERVER_CONSTANTS.MIN_FOOD_COUNT, target)
    );
  }

  private randomPointInArena(radius: number) {
    const r = Math.sqrt(Math.random()) * radius;
    const theta = Math.random() * Math.PI * 2;
    return { x: Math.cos(theta) * r, y: Math.sin(theta) * r };
  }

  private randomPointInArenaWithCenterWeight() {
    const arenaRadius = this.arenaRadius;
    const centerZoneRadius = arenaRadius * SERVER_CONSTANTS.ARENA_CENTER_ZONE_RATIO;
    const a1 = Math.PI * centerZoneRadius * centerZoneRadius;
    const a2 = Math.PI * arenaRadius * arenaRadius - a1;
    const w1 = SERVER_CONSTANTS.ARENA_CENTER_SPAWN_WEIGHT;
    const w2 = 1;
    const pCenter = (w1 * a1) / (w1 * a1 + w2 * a2);

    const theta = Math.random() * Math.PI * 2;
    let r: number;
    if (Math.random() < pCenter) {
      r = Math.sqrt(Math.random()) * centerZoneRadius;
    } else {
      const r0 = centerZoneRadius;
      r = Math.sqrt(r0 * r0 + Math.random() * (arenaRadius * arenaRadius - r0 * r0));
    }

    return { x: Math.cos(theta) * r, y: Math.sin(theta) * r };
  }

  private spawnAISnakes(anchorPlayer?: Player) {
    if (this.aiSnakes.size > 0) return;

    const aiSnakeCount = 8;
    
    for (let i = 0; i < aiSnakeCount; i++) {
      this.spawnSingleAISnake(i, anchorPlayer);
    }
    
    console.log(`Spawned ${aiSnakeCount} AI snakes`);
  }

  private spawnSingleAISnake(index: number, anchorPlayer?: Player) {
    const player = new Player();
    player.id = `ai_${index}_${Date.now()}`;
    
    const anchor = anchorPlayer ?? this.getAnyHumanPlayer();
    if (anchor) {
      const angle = Math.random() * Math.PI * 2;
      const distance = 300 + Math.random() * 600;
      player.x = anchor.x + Math.cos(angle) * distance;
      player.y = anchor.y + Math.sin(angle) * distance;
    } else {
      player.x = (Math.random() - 0.5) * SERVER_CONSTANTS.PLAYER_SPAWN_RANGE;
      player.y = (Math.random() - 0.5) * SERVER_CONSTANTS.PLAYER_SPAWN_RANGE;
    }
    player.angle = -Math.PI / 2;
    player.name = `AI_${Math.floor(Math.random() * 1000)}`;
    player.radius = PhysicsConfig.BASE_RADIUS;
    player.skin = Math.floor(Math.random() * SERVER_CONSTANTS.SKIN_COUNT);
    
    this.state.players.set(player.id, player);
    
    const snakeLogic = new SnakeLogic(player, this);
    snakeLogic.initSegments();
    const aiController = new AISnakeController(snakeLogic);
    
    this.collisionSystem.registerSnakeLogic(player.id, snakeLogic);
    this.snakes.set(player.id, snakeLogic);
    this.aiSnakes.set(player.id, aiController);
  }

  private getAnyHumanPlayer(): Player | null {
    for (const p of this.state.players.values()) {
      if (typeof p.id === "string" && p.id.startsWith("ai_")) continue;
      return p;
    }
    return null;
  }

  private keepAISnakesNearHumans() {
    const humans: Player[] = [];
    for (const p of this.state.players.values()) {
      if (typeof p.id === "string" && p.id.startsWith("ai_")) continue;
      humans.push(p);
    }
    if (humans.length === 0) return;

    const maxDist = PhysicsConfig.AOI_RADIUS * 3;
    const maxDistSq = maxDist * maxDist;

    for (const [aiId] of this.aiSnakes) {
      const aiSnake = this.snakes.get(aiId);
      if (!aiSnake || !aiSnake.player.alive) continue;

      let nearest: Player | null = null;
      let bestSq = Infinity;
      for (const h of humans) {
        const dx = aiSnake.player.x - h.x;
        const dy = aiSnake.player.y - h.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < bestSq) {
          bestSq = d2;
          nearest = h;
        }
      }

      if (!nearest || bestSq <= maxDistSq) continue;

      const angle = Math.random() * Math.PI * 2;
      const distance = 400 + Math.random() * 800;
      aiSnake.player.x = nearest.x + Math.cos(angle) * distance;
      aiSnake.player.y = nearest.y + Math.sin(angle) * distance;
      aiSnake.player.angle = -Math.PI / 2;
      aiSnake.initSegments();
    }
  }

  private removeAllAISnakes() {
    for (const [aiId, aiController] of this.aiSnakes) {
      this.state.players.delete(aiId);
      this.snakes.delete(aiId);
      this.collisionSystem.unregisterSnakeLogic(aiId);
    }
    this.aiSnakes.clear();
    this.aiUpdateQueue = [];
    this.aiUpdateIndex = 0;
  }

  // ⚠️ NEW: Remove some AI snakes when overloaded
  private removeSomeAISnakes(count: number) {
    const aiIds = Array.from(this.aiSnakes.keys());
    const toRemove = aiIds.slice(0, Math.min(count, aiIds.length));
    
    for (const aiId of toRemove) {
      this.state.players.delete(aiId);
      this.snakes.delete(aiId);
      this.collisionSystem.unregisterSnakeLogic(aiId);
      this.aiSnakes.delete(aiId);
    }
    
    console.log(`Removed ${toRemove.length} AI snakes due to high load`);
    this.aiUpdateQueue = Array.from(this.aiSnakes.keys());
    this.aiUpdateIndex = 0;
  }

  convertSnakeToFood(playerId: string) {
    const snakeLogic = this.snakes.get(playerId);
    if (!snakeLogic) return;

    const pelletsToCreate = Math.max(
      1,
      Math.floor(snakeLogic.player.mass * SERVER_CONSTANTS.DISCONNECT_FOOD_FRACTION)
    );
    
    for (let i = 0; i < pelletsToCreate; i++) {
      const food = new Food();
      const angle = Math.random() * Math.PI * 2;
      const distance =
        Math.random() *
          (SERVER_CONSTANTS.DISCONNECT_FOOD_DISTANCE_MAX -
            SERVER_CONSTANTS.DISCONNECT_FOOD_DISTANCE_MIN) +
        SERVER_CONSTANTS.DISCONNECT_FOOD_DISTANCE_MIN;
      
      food.x = snakeLogic.player.x + Math.cos(angle) * distance;
      food.y = snakeLogic.player.y + Math.sin(angle) * distance;
      food.kind = 0;
      food.points = 100 * SERVER_CONSTANTS.DISCONNECT_FOOD_VALUE;
      food.segments = SERVER_CONSTANTS.DISCONNECT_FOOD_VALUE;
      food.mass = 4 + Math.random() * 4;
      
      const id = `dead_${playerId}_${i}_${Date.now()}`;
      this.state.food.set(id, food);
      this.collisionSystem.addFoodToGrid(id, food);
    }
  }
}

const app = express();
app.use(cors());
app.use(express.json());

const gameServer = new Server({
  server: http.createServer(app)
});

const roomName = process.env.BLOCK21_ROOM_NAME || "block21";
const region = process.env.BLOCK21_REGION || "local";
gameServer.define(roomName, Block21Room);

gameServer.listen(2567);
console.log(`⚡ OPTIMIZED SERVER: Listening on ws://localhost:2567`);
console.log(`📊 Features: Load Balancing | Dynamic AI | Performance Monitoring`);
