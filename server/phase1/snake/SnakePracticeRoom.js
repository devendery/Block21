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

function isBotId(id) {
  return typeof id === "string" && id.startsWith("bot:");
}

class SnakePracticeRoom extends Room {
  onCreate(options) {
    this.maxClients = 10;
    this.respawnMs = 900;
    this.foodCount = 18;
    this.botCount = Math.min(20, Math.max(0, Number(options?.bots ?? process.env.PHASE1_PRACTICE_BOTS ?? 8)));
    this.rewardsEnabled = false;
    this.foodCaps = { rareTimes: [], epicTimes: [], goldenTimes: [] };

    this.fixedStepMs = 1000 / 60;
    this.accumMs = 0;

    this.baseLength = 22;
    this.logicMaxSegments = 200;
    this.renderMaxSegments = 120;
    this.spacingSteps = 5;

    this.headRadius = 0.45;
    this.bodyRadius = 0.4;
    this.foodRadius = 0.38;
    this.segmentBucketSize = 1.0;

    this.turnSpeed = 7.2;
    this.accel = 20;
    this.frictionPerStep = 0.92;
    this.maxSpeed = 10.0;

    this.state = new SnakeSharedState();
    this.state.status = "playing";
    this.state.gridW = 64;
    this.state.gridH = 40;

    this.physicsById = new Map();

    this.spawnFoods();
    this.spawnBots();

    this.onMessage("input", (client, message) => {
      const p = this.state.players.get(client.sessionId);
      const phys = this.physicsById.get(client.sessionId);
      if (!p || !phys || !p.alive) return;
      const t = typeof message?.targetAngle === "number" ? message.targetAngle : null;
      if (t !== null && Number.isFinite(t)) phys.targetAngle = normalizeAngle(t);
      phys.boost = Boolean(message?.boost);
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
    player.address = address || `guest-${client.sessionId}`;
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

  spawnBots() {
    for (let i = 0; i < this.botCount; i++) {
      const bot = new SnakePlayerState();
      bot.address = `BOT_${i + 1}`;
      bot.alive = true;
      bot.score = 0;
      bot.respawnAt = 0;
      bot.length = this.baseLength;
      bot.skin = ["classic", "neon", "magma", "toxic", "void", "scales"][randomInt(0, 5)];
      bot.eyes = ["cat", "round", "angry"][randomInt(0, 2)];
      bot.mouth = ["tongue", "smile", "fangs"][randomInt(0, 2)];
      const id = `bot:${i}`;
      this.state.players.set(id, bot);
      this.physicsById.set(id, { vx: 0, vy: 0, targetAngle: randomInt(0, 360) * (Math.PI / 180), boost: false, trail: [], lastInputAt: 0 });
      this.spawnPlayer(id);
    }
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
      return { grow: true };
    }
    if (rarity === "rare") {
      p.score += 25 * scoreMult;
      return { grow: true };
    }
    if (rarity === "epic") {
      p.score += 35 * scoreMult;
      if (food.power === "shield") p.shield = true;
      p.power = food.power || "";
      p.powerEndsAt = now + 8000;
      return { grow: true };
    }
    if (rarity === "golden") {
      p.score += 100 * scoreMult;
      return { grow: true };
    }
    p.score += 10 * scoreMult;
    return { grow: true };
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

  botThink(id, now) {
    const p = this.state.players.get(id);
    const phys = this.physicsById.get(id);
    if (!p || !phys || !p.alive) return;
    if (now - phys.lastInputAt < 180) return;
    phys.lastInputAt = now;

    let best = null;
    let bestD = Infinity;
    for (const f of this.state.foods) {
      const d = dist2(p.x, p.y, f.x, f.y);
      if (d < bestD) {
        bestD = d;
        best = f;
      }
    }

    const cx = this.state.gridW * 0.5;
    const cy = this.state.gridH * 0.5;
    const pullToCenter = dist2(p.x, p.y, cx, cy) > 220;

    const tx = pullToCenter ? cx : best ? best.x : cx;
    const ty = pullToCenter ? cy : best ? best.y : cy;
    const a = Math.atan2(ty - p.y, tx - p.x);
    const jitter = (Math.random() - 0.5) * 0.25;
    phys.targetAngle = normalizeAngle(a + jitter);
    phys.boost = bestD > 160 && Math.random() < 0.3;
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

      if (isBotId(id)) this.botThink(id, now);

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
          if (s.owner === a.id && s.index > 18) {
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
          f.x += dx * inv * 3.0 * dt;
          f.y += dy * inv * 3.0 * dt;
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
          this.respawnFood(food, now);
        }
      }
    }
  }
}

module.exports = { SnakePracticeRoom };
