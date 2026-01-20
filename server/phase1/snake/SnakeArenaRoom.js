const { Room } = require("@colyseus/core");
const { FoodState, SnakePlayerState, SnakeSharedState } = require("./schema");
const { pickFood } = require("./foodCatalog");
const {
  angleStep,
  buildSegmentBuckets,
  dist2,
  getNearbyBucketItems,
  normalizeAngle,
  pushTrail,
  sampleTrailByIndex,
} = require("./physics");

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function clamp(v, a, b) {
  return Math.max(a, Math.min(b, v));
}

class SnakeArenaRoom extends Room {
  onCreate() {
    this.maxClients = 120;
    this.respawnMs = 1200;
    this.foodCount = 34;
    this.rewardsEnabled = true;
    this.foodCaps = { rareTimes: [], epicTimes: [], goldenTimes: [] };
    this.goldenRewardTimes = [];

    this.fixedStepMs = 1000 / 60;
    this.accumMs = 0;

    this.baseLength = 24;
    this.logicMaxSegments = 240;
    this.renderMaxSegments = 140;
    this.spacingSteps = 5;

    this.headRadius = 0.45;
    this.bodyRadius = 0.4;
    this.foodRadius = 0.38;
    this.segmentBucketSize = 1.0;

    this.turnSpeed = 7.5;
    this.accel = 22;
    this.frictionPerStep = 0.92;
    this.maxSpeed = 10.5;

    this.state = new SnakeSharedState();
    this.state.status = "playing";
    this.state.gridW = 96;
    this.state.gridH = 56;

    this.physicsById = new Map();

    this.spawnFoods();

    this.onMessage("input", (client, message) => {
      const p = this.state.players.get(client.sessionId);
      const phys = this.physicsById.get(client.sessionId);
      if (!p || !phys || !p.alive) return;
      const t = typeof message?.targetAngle === "number" ? message.targetAngle : null;
      if (t !== null && Number.isFinite(t)) phys.targetAngle = normalizeAngle(t);
      const boost = Boolean(message?.boost);
      phys.boost = boost;
      phys.lastInputAt = Date.now();
    });

    this.onMessage("dir", (client, message) => {
      const p = this.state.players.get(client.sessionId);
      const phys = this.physicsById.get(client.sessionId);
      if (!p || !phys || !p.alive) return;
      const dir = message && typeof message.dir === "string" ? message.dir : "";
      if (dir === "right") phys.targetAngle = 0;
      if (dir === "down") phys.targetAngle = Math.PI / 2;
      if (dir === "left") phys.targetAngle = Math.PI;
      if (dir === "up") phys.targetAngle = -Math.PI / 2;
      phys.lastInputAt = Date.now();
    });

    this.onMessage("cosmetic", (client, message) => {
      const player = this.state.players.get(client.sessionId);
      if (!player) return;
      if (message && typeof message.skin === "string") player.skin = message.skin;
      if (message && typeof message.eyes === "string") player.eyes = message.eyes;
      if (message && typeof message.mouth === "string") player.mouth = message.mouth;
    });

    this.setSimulationInterval((deltaTime) => this.update(deltaTime), this.fixedStepMs);
  }

  onJoin(client, options) {
    const address = options && typeof options.address === "string" ? options.address : "";
    const player = new SnakePlayerState();
    player.address = address;
    player.alive = true;
    player.score = 0;
    player.respawnAt = 0;
    player.length = this.baseLength;
    if (options && typeof options.skin === "string") player.skin = options.skin;
    if (options && typeof options.eyes === "string") player.eyes = options.eyes;
    if (options && typeof options.mouth === "string") player.mouth = options.mouth;
    this.state.players.set(client.sessionId, player);

    this.physicsById.set(client.sessionId, { vx: 0, vy: 0, targetAngle: 0, boost: false, trail: [], lastInputAt: Date.now() });
    this.spawnPlayer(client.sessionId);
  }

  onLeave(client) {
    this.state.players.delete(client.sessionId);
    this.physicsById.delete(client.sessionId);
  }

  update(deltaTime) {
    const dtMs = typeof deltaTime === "number" && Number.isFinite(deltaTime) ? deltaTime : this.fixedStepMs;
    this.accumMs += dtMs;
    while (this.accumMs >= this.fixedStepMs) {
      this.step(this.fixedStepMs / 1000);
      this.accumMs -= this.fixedStepMs;
    }
  }

  randomSpawnPoint() {
    const x = randomInt(2, this.state.gridW - 3) + 0.5;
    const y = randomInt(2, this.state.gridH - 3) + 0.5;
    return { x, y };
  }

  spawnPlayer(id) {
    const p = this.state.players.get(id);
    const phys = this.physicsById.get(id);
    if (!p || !phys) return;
    const start = this.randomSpawnPoint();
    p.x = start.x;
    p.y = start.y;
    p.angle = randomInt(0, 360) * (Math.PI / 180);
    p.length = Math.max(this.baseLength, p.length || this.baseLength);
    p.alive = true;
    p.respawnAt = 0;
    p.rewardMultBps = 0;
    p.lastFood = "";
    p.lastRarity = "";
    phys.vx = 0;
    phys.vy = 0;
    phys.targetAngle = p.angle;
    phys.boost = false;
    phys.trail.length = 0;
    const trailMax = this.spacingSteps * (Math.min(p.length, this.renderMaxSegments) + 12);
    for (let i = 0; i < trailMax; i++) pushTrail(phys.trail, p.x, p.y, trailMax);
  }

  spawnFoods() {
    while (this.state.foods.length > 0) this.state.foods.pop();
    const now = Date.now();
    for (let i = 0; i < this.foodCount; i++) {
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

  applyFood(p, food, now) {
    const powerActive = p.power && p.powerEndsAt && now < p.powerEndsAt;
    const scoreMult = powerActive && p.power === "double" ? 2 : 1;

    const rarity = food.rarity || "common";
    p.lastFood = food.kind || "";
    p.lastRarity = rarity;

    if (rarity === "common") {
      p.score += 10 * scoreMult;
      return { grow: true, rewardTrigger: false };
    }

    if (rarity === "rare") {
      p.score += 25 * scoreMult;
      if (this.rewardsEnabled) p.rewardMultBps = Math.min(2000, (p.rewardMultBps || 0) + 50);
      return { grow: true, rewardTrigger: false };
    }

    if (rarity === "epic") {
      p.score += 35 * scoreMult;
      if (food.power === "shield") p.shield = true;
      p.power = food.power || "";
      p.powerEndsAt = now + 8000;
      return { grow: true, rewardTrigger: false };
    }

    if (rarity === "golden") {
      p.score += 100 * scoreMult;
      if (!this.rewardsEnabled) return { grow: true, rewardTrigger: false };
      while (this.goldenRewardTimes.length > 0 && now - this.goldenRewardTimes[0] > 180_000) this.goldenRewardTimes.shift();
      if (this.goldenRewardTimes.length < 2) {
        this.goldenRewardTimes.push(now);
        return { grow: true, rewardTrigger: true };
      }
      return { grow: true, rewardTrigger: false };
    }

    p.score += 10 * scoreMult;
    return { grow: true, rewardTrigger: false };
  }

  killPlayer(id, now) {
    const p = this.state.players.get(id);
    const phys = this.physicsById.get(id);
    if (!p || !phys) return;
    if (p.shield && p.power === "shield" && p.powerEndsAt && now < p.powerEndsAt) {
      p.shield = false;
      p.power = "";
      p.powerEndsAt = 0;
      return;
    }
    p.alive = false;
    p.respawnAt = now + this.respawnMs;
    phys.vx = 0;
    phys.vy = 0;
    phys.trail.length = 0;
  }

  step(dt) {
    const now = Date.now();

    for (const [id, p] of this.state.players) {
      const phys = this.physicsById.get(id);
      if (!phys) continue;

      if (p.power && p.powerEndsAt && now >= p.powerEndsAt) {
        p.power = "";
        p.powerEndsAt = 0;
        p.shield = false;
      }

      if (!p.alive) {
        if (p.respawnAt && now >= p.respawnAt) this.spawnPlayer(id);
        continue;
      }

      const isSpeed = p.power && p.powerEndsAt && now < p.powerEndsAt && p.power === "speed";
      const boost = Boolean(phys.boost) || Boolean(isSpeed);
      const turn = this.turnSpeed * (boost ? 0.72 : 1.0);
      const accel = this.accel * (boost ? 1.35 : 1.0);
      const maxSpeed = this.maxSpeed * (boost ? 1.25 : 1.0);

      p.angle = angleStep(p.angle, phys.targetAngle, turn, dt);

      phys.vx += Math.cos(p.angle) * accel * dt;
      phys.vy += Math.sin(p.angle) * accel * dt;

      const friction = boost ? Math.max(0.86, this.frictionPerStep - 0.03) : this.frictionPerStep;
      phys.vx *= friction;
      phys.vy *= friction;

      const sp = Math.sqrt(phys.vx * phys.vx + phys.vy * phys.vy);
      if (sp > maxSpeed) {
        const s = maxSpeed / sp;
        phys.vx *= s;
        phys.vy *= s;
      }

      p.x += phys.vx * dt;
      p.y += phys.vy * dt;

      const trailMax = this.spacingSteps * (Math.min(Math.max(p.length, this.baseLength), this.renderMaxSegments) + 20);
      pushTrail(phys.trail, p.x, p.y, trailMax);

      const hitWall = p.x < 0.5 || p.x > this.state.gridW - 0.5 || p.y < 0.5 || p.y > this.state.gridH - 0.5;
      if (hitWall) this.killPlayer(id, now);
    }

    const headEntries = [];
    const segmentEntries = [];
    for (const [id, p] of this.state.players) {
      const phys = this.physicsById.get(id);
      if (!p?.alive || !phys) continue;
      headEntries.push({ id, x: p.x, y: p.y });
      const count = Math.min(p.length || this.baseLength, this.logicMaxSegments);
      const segs = sampleTrailByIndex(phys.trail, count, this.spacingSteps);
      for (let i = 8; i < segs.length; i++) {
        const s = segs[i];
        segmentEntries.push({ owner: id, index: i, x: s.x, y: s.y });
      }
    }

    const segmentBuckets = buildSegmentBuckets(segmentEntries, this.segmentBucketSize);

    for (const a of headEntries) {
      const p = this.state.players.get(a.id);
      if (!p || !p.alive) continue;
      const nearby = getNearbyBucketItems(segmentBuckets, p.x, p.y, this.segmentBucketSize);
      for (const s of nearby) {
        const min = this.headRadius + this.bodyRadius;
        if (dist2(p.x, p.y, s.x, s.y) < min * min) {
          if (s.owner !== a.id) {
            this.killPlayer(a.id, now);
            break;
          }
        }
      }
    }

    for (let i = 0; i < headEntries.length; i++) {
      for (let j = i + 1; j < headEntries.length; j++) {
        const a = headEntries[i];
        const b = headEntries[j];
        const min = this.headRadius * 2;
        if (dist2(a.x, a.y, b.x, b.y) < min * min) {
          this.killPlayer(a.id, now);
          this.killPlayer(b.id, now);
        }
      }
    }

    for (const [id, p] of this.state.players) {
      const phys = this.physicsById.get(id);
      if (!p?.alive || !phys) continue;

      if (p.power && p.powerEndsAt && now < p.powerEndsAt && p.power === "magnet") {
        for (const f of this.state.foods) {
          const d2 = dist2(p.x, p.y, f.x, f.y);
          if (d2 > 12) continue;
          const dx = p.x - f.x;
          const dy = p.y - f.y;
          const inv = 1 / Math.max(0.0001, Math.sqrt(dx * dx + dy * dy));
          f.x += dx * inv * 3.2 * dt;
          f.y += dy * inv * 3.2 * dt;
          f.x = clamp(f.x, 0.8, this.state.gridW - 0.8);
          f.y = clamp(f.y, 0.8, this.state.gridH - 0.8);
        }
      }

      for (let i = 0; i < this.state.foods.length; i++) {
        const food = this.state.foods[i];
        const min = this.headRadius + this.foodRadius;
        if (dist2(p.x, p.y, food.x, food.y) < min * min) {
          const res = this.applyFood(p, food, now);
          if (res.grow) p.length = Math.min(10_000, (p.length || this.baseLength) + 1);
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
  }
}

module.exports = { SnakeArenaRoom };
