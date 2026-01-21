const { SnakeRoom } = require("./SnakeRoom");
const { SnakeSharedState, SnakePlayerState, FoodState } = require("./schema");
const { pickFood } = require("./foodCatalog");
const {
  updatePlayerPhysics,
  checkCollisions,
  dist2,
  normalizeAngle,
  clamp,
} = require("./physics");

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function isBotId(id) {
  return typeof id === "string" && id.startsWith("bot:");
}

class SnakePracticeRoom extends SnakeRoom {
  onCreate(options) {
    // Call base init
    super.onCreate(options);
    
    // Override defaults for Practice
    this.maxClients = 10;
    this.respawnMs = 900;
    this.foodCount = 18;
    this.botCount = Math.min(20, Math.max(0, Number(options?.bots ?? process.env.PHASE1_PRACTICE_BOTS ?? 8)));
    this.rewardsEnabled = false;
    
    this.state = new SnakeSharedState();
    this.state.status = "playing";
    this.state.gridW = 64;
    this.state.gridH = 40;
    
    this.spawnFoods();
    this.spawnBots();
    
    // Use base loop - no setSimulationInterval here because super.onCreate calls it.
    // But wait, super.onCreate calls setSimulationInterval with this.update bound.
    // If we don't override update(), it uses base update().
    // Base update() calls step().
    // If we don't override step(), it uses base step().
    
    // HOWEVER: Practice needs bot AI.
    // We can inject bot AI into the loop by overriding step(), calling super.step(), or...
    // Better: Override step(), run bot logic, then call super.step().
  }

  // Override step to include Bot AI, then delegate to base physics
  step(dt) {
    const now = Date.now();
    
    // Run Bot Logic
    for (const [id, p] of this.state.players) {
      if (isBotId(id) && p.alive) {
        this.botThink(id, now);
      }
    }
    
    // Delegate everything else to base SnakeRoom
    super.step(dt);
  }

  // Override spawnFoods for specific count
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
  
  // Clean up unused overrides by NOT including them (they inherit from base)
  // Removed: update, randomSpawnPoint, spawnPlayer, respawnFood, applyFood, killPlayer
}

module.exports = { SnakePracticeRoom };
