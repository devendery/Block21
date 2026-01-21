const { Room } = require("@colyseus/core");
const { Schema, MapSchema, ArraySchema, defineTypes } = require("@colyseus/schema");
const { FoodState } = require("./schema");
const { pickFood } = require("./foodCatalog");
const {
  updatePlayerPhysics,
  checkCollisions,
  dist2,
  clamp,
} = require("./physics");

const TICK_RATE = 20;
const DT = 1 / TICK_RATE;

// These constants are now largely managed by physics.js defaults,
// but we keep them here for reference or overrides if needed.
const BASE_MAP_W = 96;
const BASE_MAP_H = 56;

class PlayerState extends Schema {
  constructor() {
    super();
    this.address = "";
    this.alive = true;
    this.score = 0;
    this.targetAngle = 0;
    this.speed = 0;
    this.mass = 0;
    this.skin = "classic";
    this.eyes = "cat";
    this.mouth = "tongue";
    this.power = "";
    this.powerEndsAt = 0;
    this.shield = false;
    this.rewardMultBps = 0;
    this.lastFood = "";
    this.lastRarity = "";
    this.x = 0;
    this.y = 0;
    this.angle = 0;
    this.length = 0;
    this.boosting = false;
    this.radius = 0.35;
    this.dangerRadius = 0.45;
  }
}

defineTypes(PlayerState, {
  address: "string",
  alive: "boolean",
  score: "int32",
  targetAngle: "number",
  speed: "number",
  mass: "number",
  skin: "string",
  eyes: "string",
  mouth: "string",
  power: "string",
  powerEndsAt: "int64",
  shield: "boolean",
  rewardMultBps: "int16",
  lastFood: "string",
  lastRarity: "string",
  x: "number",
  y: "number",
  angle: "number",
  length: "int32",
  boosting: "boolean",
  radius: "number",
  dangerRadius: "number",
});

class SnakeState extends Schema {
  constructor() {
    super();
    this.players = new MapSchema();
    this.foods = new ArraySchema();
    this.status = "waiting";
    this.startedAt = 0;
    this.endedAt = 0;
    this.gridW = BASE_MAP_W;
    this.gridH = BASE_MAP_H;
  }
}

defineTypes(SnakeState, {
  players: { map: PlayerState },
  foods: [FoodState],
  status: "string",
  startedAt: "int64",
  endedAt: "int64",
  gridW: "number",
  gridH: "number",
});

// Deprecated local helpers (now imported from physics.js)
// function randomInt...
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// clamp is imported from physics.js
// rotateTowards is deprecated/unused (logic in physics.js)

function normalizeAngle(a) {
  while (a > Math.PI) a -= Math.PI * 2;
  while (a < -Math.PI) a += Math.PI * 2;
  return a;
}

function dist(x1, y1, x2, y2) {
  return Math.hypot(x2 - x1, y2 - y1);
}

class SnakeRoom extends Room {
  onCreate(options) {
    this.maxClients = 5;
    this.state = new SnakeState();
    this.roomIdExternal = options && typeof options.roomId === "string" ? options.roomId : null;
    this.rewardsEnabled = true;
    this.foodCaps = { rareTimes: [], epicTimes: [], goldenTimes: [] };
    this.goldenRewardTimes = [];
    this.allowSolo =
      process.env.PHASE1_ALLOW_SOLO === "true"
        ? true
        : process.env.PHASE1_ALLOW_SOLO === "false"
          ? false
          : process.env.NODE_ENV !== "production";

    this.fixedStepMs = 1000 / TICK_RATE;
    this.accumMs = 0;

    this.baseLength = 5; // Minimum length 5
    this.logicMaxSegments = 240;
    this.renderMaxSegments = 140;
    this.spacingSteps = 5;

    this.foodRadius = 0.38;
    this.segmentBucketSize = 1.0;

    this.physicsById = new Map();

    this.onMessage("input", (client, message) => {
      const p = this.state.players.get(client.sessionId);
      if (!p || !p.alive) return;
      const t = typeof message?.targetAngle === "number" ? message.targetAngle : null;
      if (t !== null && Number.isFinite(t)) p.targetAngle = normalizeAngle(t);
      p.boosting = Boolean(message?.boost);
      const phys = this.physicsById.get(client.sessionId);
      if (phys) phys.lastInputAt = Date.now();
    });

    this.onMessage("dir", (client, message) => {
      const p = this.state.players.get(client.sessionId);
      if (!p || !p.alive) return;
      const dir = message && typeof message.dir === "string" ? message.dir : "";
      if (dir === "right") p.targetAngle = 0;
      if (dir === "down") p.targetAngle = Math.PI / 2;
      if (dir === "left") p.targetAngle = Math.PI;
      if (dir === "up") p.targetAngle = -Math.PI / 2;
      const phys = this.physicsById.get(client.sessionId);
      if (phys) phys.lastInputAt = Date.now();
    });

    this.onMessage("cosmetic", (client, message) => {
      const player = this.state.players.get(client.sessionId);
      if (!player) return;
      if (message && typeof message.skin === "string") player.skin = message.skin;
      if (message && typeof message.eyes === "string") player.eyes = message.eyes;
      if (message && typeof message.mouth === "string") player.mouth = message.mouth;
    });

    this.spawnFoods();
    this.setSimulationInterval((deltaTime) => this.update(deltaTime), this.fixedStepMs);
  }

  onJoin(client, options) {
    const address = options && typeof options.address === "string" ? options.address : "";
    const player = new PlayerState();
    player.address = address;
    player.alive = true;
    player.score = 0;
    player.length = this.baseLength;
    player.mass = 10;
    player.speed = 0;
    player.boosting = false;
    if (options && typeof options.skin === "string") player.skin = options.skin;
    if (options && typeof options.eyes === "string") player.eyes = options.eyes;
    if (options && typeof options.mouth === "string") player.mouth = options.mouth;

    this.state.players.set(client.sessionId, player);
    this.physicsById.set(client.sessionId, { trail: [], lastInputAt: Date.now() });
    this.spawnPlayer(client.sessionId);

    const minPlayers = this.allowSolo ? 1 : 2;
    if (this.state.status === "waiting" && this.state.players.size >= minPlayers) {
      this.state.status = "playing";
      this.state.startedAt = Date.now();
    }
  }

  onLeave(client) {
    this.state.players.delete(client.sessionId);
    this.physicsById.delete(client.sessionId);
    if (this.state.players.size === 0) {
      this.state.status = "waiting";
      this.state.startedAt = 0;
      this.state.endedAt = 0;
      this.spawnCoin();
    }
  }

  spawnCoin() {
    this.spawnFoods();
  }

  spawnFoods() {
    while (this.state.foods.length > 0) this.state.foods.pop();
    const now = Date.now();
    const { kind, rarity, power } = pickFood(now, this.foodCaps);
    const food = new FoodState(0, 0, kind, rarity);
    food.power = power;
    food.seed = randomInt(0, 0x7fffffff);
    food.spawnedAt = now;
    const cell = this.randomSpawnPoint();
    food.x = cell.x;
    food.y = cell.y;
    this.state.foods.push(food);
  }

  randomSpawnPoint() {
    const w = this.state.gridW || BASE_MAP_W;
    const h = this.state.gridH || BASE_MAP_H;
    const maxX = Math.max(6, Math.floor(w) - 3);
    const maxY = Math.max(6, Math.floor(h) - 3);
    const x = randomInt(2, maxX) + 0.5;
    const y = randomInt(2, maxY) + 0.5;
    return { x, y };
  }

  applyFood(p, food, now) {
    const powerActive = p.power && p.powerEndsAt && now < p.powerEndsAt;
    const scoreMult = powerActive && p.power === "double" ? 2 : 1;

    const rarity = food.rarity || "common";
    p.lastFood = food.kind || "";
    p.lastRarity = rarity;

    if (rarity === "common") {
      p.score += 10 * scoreMult;
      p.mass += 1;
    } else if (rarity === "rare") {
      p.score += 25 * scoreMult;
      p.mass += 3;
      if (this.rewardsEnabled) {
        p.rewardMultBps = Math.min(2000, (p.rewardMultBps || 0) + 50);
      }
    } else if (rarity === "epic") {
      p.score += 35 * scoreMult;
      p.mass += 7;
      if (food.power === "shield") p.shield = true;
      p.power = food.power || "";
      p.powerEndsAt = now + 8000;
    } else if (rarity === "golden") {
      p.score += 100 * scoreMult;
      p.mass += 15;
      if (this.rewardsEnabled && (this.goldenRewardTimes.length < 2)) {
        this.goldenRewardTimes.push(now);
        return { grow: true, rewardTrigger: true };
      }
    }

    // Recalculate length based on mass
    // Length = floor(mass * 0.85), Min 5
    // Need to account for base mass? Let's assume mass starts at 0 and base length is handled.
    // Actually, "Minimum length: 5 segments".
    // Let's use p.length directly derived from mass.
    // If mass starts at 0, length is 5.
    
    return { grow: true, rewardTrigger: false };
  }

  // --- GAME LOOP ---

  update(deltaTime) {
    if (this.state.status !== "playing") return;
    const dtMs = typeof deltaTime === "number" && Number.isFinite(deltaTime) ? deltaTime : this.fixedStepMs;
    this.accumMs += dtMs;
    while (this.accumMs >= this.fixedStepMs) {
      this.step(this.fixedStepMs / 1000);
      this.accumMs -= this.fixedStepMs;
    }
  }

  spawnPlayer(id) {
    const p = this.state.players.get(id);
    const phys = this.physicsById.get(id);
    if (!p || !phys) return;
    const start = this.randomSpawnPoint();
    p.x = start.x;
    p.y = start.y;
    p.angle = randomInt(0, 360) * (Math.PI / 180);
    p.targetAngle = p.angle;
    p.speed = 0;
    p.mass = 10;
    p.boosting = false;
    p.length = Math.max(this.baseLength, Math.floor(p.mass * 0.85));
    phys.trail.length = 0;
    const trailMax = this.spacingSteps * (Math.min(p.length, this.renderMaxSegments) + 12);
    for (let i = 0; i < trailMax; i++) pushTrail(phys.trail, p.x, p.y, trailMax);
  }

  respawnFood(food, now) {
    const { kind, rarity, power } = pickFood(now, this.foodCaps);
    const cell = this.randomSpawnPoint();
    food.x = cell.x;
    food.y = cell.y;
    food.kind = kind;
    food.rarity = rarity;
    food.power = power;
    food.seed = randomInt(0, 0x7fffffff);
    food.spawnedAt = now;
  }

  killPlayer(id, now) {
    const p = this.state.players.get(id);
    if (!p) return;
    p.alive = false;

    // Drop food on death
    const dropCount = Math.min(Math.floor(p.mass / 2), 10);
    // TODO: Spawn actual food? Original code omitted it too in the snippet I read?
    // Let's ensure we just mark them dead. The physics check already stops updating them.
    
    // Clear trail to prevent ghost collisions (though checkCollisions skips dead players)
    const phys = this.physicsById.get(id);
    if (phys) phys.trail.length = 0;
  }

  updateMapSize(aliveCount) {
    const scale = clamp(1 + (aliveCount - 5) * 0.06, 1, 1.8);
    this.state.gridW = BASE_MAP_W * scale;
    this.state.gridH = BASE_MAP_H * scale;

    if (aliveCount <= 5) {
      this.state.gridW -= 0.15 * DT;
      this.state.gridH -= 0.15 * DT;
    }
  }

  // Deprecated: Logic moved to physics.js
  // Keeping method stub if subclasses call it (though they shouldn't)
  hitWall(p) { return false; }

  // Deprecated: Logic moved to physics.js
  updateMovement(id, p) {}

  // Deprecated: Logic moved to physics.js
  updateGrowth(p) {}

  // Deprecated: Logic moved to physics.js
  handleCollisions(players, now) {}

  step(dt) {
    const now = Date.now();

    // 1. Check Powerups
    for (const [id, p] of this.state.players) {
      if (p.power && p.powerEndsAt && now >= p.powerEndsAt) {
        p.power = "";
        p.powerEndsAt = 0;
        p.shield = false;
      }
    }

    // 2. Identify Alive Players
    const alivePlayers = [];
    for (const [id, p] of this.state.players) {
      if (!p?.alive) {
        // If dead for > 3s, remove them
        // Note: For Arena/Match, we might want to keep them in state as dead for leaderboard?
        // But for physics, we just skip them.
        continue;
      }
      alivePlayers.push({ id, p });
    }

    this.updateMapSize(alivePlayers.length);

    // 3. Physics Update (Movement, Growth)
    for (const { id, p } of alivePlayers) {
      const phys = this.physicsById.get(id);
      
      // Magnet Powerup logic
      const food = this.state.foods.length > 0 ? this.state.foods[0] : null;
      if (food && p.power === "magnet") {
         const d2 = dist2(p.x, p.y, food.x, food.y);
         if (d2 < 16) {
           const dx = p.x - food.x;
           const dy = p.y - food.y;
           const inv = 1 / Math.max(0.0001, Math.sqrt(dx * dx + dy * dy));
           food.x += dx * inv * 3.2 * dt;
           food.y += dy * inv * 3.2 * dt;
           food.x = clamp(food.x, 0.8, (this.state.gridW || BASE_MAP_W) - 0.8);
           food.y = clamp(food.y, 0.8, (this.state.gridH || BASE_MAP_H) - 0.8);
         }
      }

      // Delegate core movement to Physics Engine
      updatePlayerPhysics(id, p, phys, dt, {
        baseMapW: this.state.gridW || BASE_MAP_W,
        baseMapH: this.state.gridH || BASE_MAP_H
      });
    }

    // 4. Collision Detection (Authoritative)
    const deadIds = checkCollisions(
      this.state.players,
      this.physicsById,
      this.state.gridW || BASE_MAP_W,
      this.state.gridH || BASE_MAP_H
    );

    // 5. Process Deaths
    for (const id of deadIds) {
      this.killPlayer(id, now);
    }

    // 6. Food Eating
    const food = this.state.foods.length > 0 ? this.state.foods[0] : null;
    for (const { id, p } of alivePlayers) {
       if (food) {
         const min = p.radius + this.foodRadius;
         if (dist2(p.x, p.y, food.x, food.y) < min * min) {
           // EAT FOOD
           const res = this.applyFood(p, food, now);
           if (res.grow) {
             const newLen = Math.floor(p.mass * 0.85);
             p.length = Math.max(this.baseLength, newLen);
           }
           if (res.rewardTrigger) {
              try {
                this.broadcast("reward_indicator", { address: p.address, amount: 1, kind: "golden" });
              } catch {}
           }
           this.respawnFood(food, now);
           break; // One eat per tick
         }
       }
    }

    // 7. Check Game Over (Match Mode logic)
    // Only if not allowSolo, or explicit logic. 
    // The original logic checked for aliveCount <= 1.
    // We should preserve that for "Match" rooms, but maybe not "Practice".
    // Since SnakeRoom is the base, let's keep it but ensure Practice overrides if needed.
    // (Actually Practice uses SnakePracticeRoom which extends this. We'll check that later).
    let aliveCount = 0;
    let lastAliveId = null;
    for (const [id, p] of this.state.players) {
      if (p.alive) {
        aliveCount += 1;
        lastAliveId = id;
      }
    }
    const totalPlayers = this.state.players.size;
    // Only end game if it's a Match room (implied by > 1 player start or specific flag?)
    // For now, keep original logic:
    const shouldFinish = totalPlayers >= 2 ? aliveCount <= 1 : aliveCount === 0;
    if (shouldFinish) this.finishGame(lastAliveId);
  }

  async finishGame(winnerSessionId) {
    if (this.state.status !== "playing") return;
    this.state.status = "finished";
    this.state.endedAt = Date.now();

    const players = [];
    for (const [id, p] of this.state.players) {
      players.push({
        sessionId: id,
        address: p.address,
        score: p.score,
        alive: p.alive,
      });
    }

    const winner = winnerSessionId ? this.state.players.get(winnerSessionId) : null;
    const payload = {
      game: "Snake",
      roomId: this.roomId,
      startedAt: this.state.startedAt,
      endedAt: this.state.endedAt,
      winnerAddress: winner ? winner.address : null,
      players,
    };

    this.broadcast("game_over", payload);
    await this.sendResultToBackend(payload);

    setTimeout(() => {
      this.disconnect();
    }, 1500);
  }

  async sendResultToBackend(payload) {
    const baseUrl = process.env.WEB_URL;
    const secret = process.env.PHASE1_SERVER_SECRET;
    if (!baseUrl || !secret) return;
    try {
      await fetch(`${baseUrl.replace(/\/$/, "")}/api/phase1/match/complete`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-phase1-secret": secret,
        },
        body: JSON.stringify(payload),
      });
    } catch {
    }
  }
}

module.exports = { SnakeRoom };
