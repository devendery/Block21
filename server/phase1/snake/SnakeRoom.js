const { Room } = require("@colyseus/core");
const { Schema, MapSchema, ArraySchema, defineTypes } = require("@colyseus/schema");
const { FoodState } = require("./schema");
const { pickFood } = require("./foodCatalog");
const {
  buildSegmentBuckets,
  dist2,
  getNearbyBucketItems,
  pushTrail,
  sampleTrailByIndex,
} = require("./physics");

const TICK_RATE = 20;
const DT = 1 / TICK_RATE;

const BASE_SPEED = 6.0;
const MAX_SPEED = 9.0;
const BOOST_MULT = 1.35;
const BOOST_MASS_DRAIN = 1.0;
const MIN_BOOST_MASS = 6;

const MAX_TURN_RATE = 2.8; // rad/sec
const TURN_PENALTY = 0.18;

const ACCEL_TIME = 0.35;
const DECEL_TIME = 0.2;

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

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function clamp(v, a, b) {
  return Math.max(a, Math.min(b, v));
}

function rotateTowards(a, b, max) {
  let d = normalizeAngle(b - a);
  d = clamp(d, -max, max);
  return a + d;
}

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

  hitWall(p) {
    const w = this.state.gridW || BASE_MAP_W;
    const h = this.state.gridH || BASE_MAP_H;
    return (
      p.x < p.dangerRadius ||
      p.x > w - p.dangerRadius ||
      p.y < p.dangerRadius ||
      p.y > h - p.dangerRadius
    );
  }

  updateMovement(id, p) {
    const phys = this.physicsById.get(id);
    if (!phys) return;

    const maxTurn = MAX_TURN_RATE * DT;
    p.angle = rotateTowards(p.angle, p.targetAngle, maxTurn);

    let targetSpeed = BASE_SPEED;
    if (p.boosting && p.mass > MIN_BOOST_MASS) {
      targetSpeed *= BOOST_MULT;
    }

    const accelT = clamp(Math.abs(targetSpeed - p.speed) / targetSpeed, 0, 1);
    const eased = 1 - Math.pow(1 - accelT, 2);
    p.speed += (targetSpeed - p.speed) * eased;

    const speedRatio = p.speed / MAX_SPEED;
    p.speed *= 1 - TURN_PENALTY * speedRatio;

    if (p.boosting && p.mass > MIN_BOOST_MASS) {
      p.mass -= BOOST_MASS_DRAIN * DT;
    }

    p.x += Math.cos(p.angle) * p.speed * DT;
    p.y += Math.sin(p.angle) * p.speed * DT;

    const trailMax =
      this.spacingSteps * (Math.min(Math.max(p.length, this.baseLength), this.renderMaxSegments) + 20);
    pushTrail(phys.trail, p.x, p.y, trailMax);
  }

  updateGrowth(p) {
    p.length = Math.max(5, Math.floor(p.mass * 0.85));
    p.radius = clamp(0.35 + p.length * 0.0025, 0.35, 1.1);
    p.dangerRadius = p.radius * 1.35;
  }

  handleCollisions(players, now) {
    for (const p of players) {
      if (!p.alive) continue;
      if (this.hitWall(p)) {
        p.alive = false;
      }
    }

    const headEntries = [];
    const segmentEntries = [];
    for (const [id, p] of this.state.players) {
      const phys = this.physicsById.get(id);
      if (!p?.alive || !phys) continue;
      headEntries.push({ id, x: p.x, y: p.y, mass: p.mass, dangerRadius: p.dangerRadius });

      const count = Math.min(p.length || this.baseLength, this.logicMaxSegments);
      const segs = sampleTrailByIndex(phys.trail, count, this.spacingSteps);
      for (let i = 1; i < segs.length; i++) {
        const s = segs[i];
        segmentEntries.push({ owner: id, x: s.x, y: s.y, dangerRadius: p.dangerRadius });
      }
    }

    for (let i = 0; i < headEntries.length; i++) {
      for (let j = i + 1; j < headEntries.length; j++) {
        const a = headEntries[i];
        const b = headEntries[j];
        const d = dist(a.x, a.y, b.x, b.y);
        if (d < a.dangerRadius + b.dangerRadius) {
          const pA = this.state.players.get(a.id);
          const pB = this.state.players.get(b.id);
          if (!pA || !pB) continue;
          if (pA.mass > pB.mass) pB.alive = false;
          else if (pA.mass < pB.mass) pA.alive = false;
          else {
            pA.alive = false;
            pB.alive = false;
          }
        }
      }
    }

    const segmentBuckets = buildSegmentBuckets(segmentEntries, this.segmentBucketSize);
    for (const a of headEntries) {
      const p = this.state.players.get(a.id);
      if (!p?.alive) continue;
      const nearby = getNearbyBucketItems(segmentBuckets, p.x, p.y, this.segmentBucketSize);
      for (const s of nearby) {
        if (s.owner === a.id) continue;
        if (dist2(p.x, p.y, s.x, s.y) < s.dangerRadius * s.dangerRadius) {
          p.alive = false;
          break;
        }
      }
    }
  }

  step(dt) {
    const now = Date.now();

    for (const [id, p] of this.state.players) {
      if (p.power && p.powerEndsAt && now >= p.powerEndsAt) {
        p.power = "";
        p.powerEndsAt = 0;
        p.shield = false;
      }
    }

    const alivePlayers = [];
    for (const [id, p] of this.state.players) {
      if (!p?.alive) continue;
      alivePlayers.push({ id, p });
    }

    this.updateMapSize(alivePlayers.length);

    for (const { id, p } of alivePlayers) {
      this.updateMovement(id, p);
      this.updateGrowth(p);
    }

    this.handleCollisions(
      alivePlayers.map(({ p }) => p),
      now,
    );

    const food = this.state.foods.length > 0 ? this.state.foods[0] : null;
    for (const [id, p] of this.state.players) {
      const phys = this.physicsById.get(id);
      if (!p?.alive || !phys) continue;

      if (food && p.power && p.powerEndsAt && now < p.powerEndsAt && p.power === "magnet") {
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

      if (food) {
        const min = p.radius + this.foodRadius;
        if (dist2(p.x, p.y, food.x, food.y) < min * min) {
          const res = this.applyFood(p, food, now);
          if (res.grow) {
            const newLen = Math.floor(p.mass * 0.85);
            p.length = Math.max(this.baseLength, newLen);
          }
          if (res.rewardTrigger) {
            try {
              this.broadcast("reward_indicator", { address: p.address, amount: 1, kind: "golden" });
            } catch {
            }
          }
          this.respawnFood(food, now);
        }
      }
    }

    let aliveCount = 0;
    let lastAliveId = null;
    for (const [id, p] of this.state.players) {
      if (p.alive) {
        aliveCount += 1;
        lastAliveId = id;
      }
    }

    const totalPlayers = this.state.players.size;
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
