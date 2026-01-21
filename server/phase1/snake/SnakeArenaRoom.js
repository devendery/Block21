const { SnakeRoom } = require("./SnakeRoom");
const { SnakeSharedState, SnakePlayerState, FoodState } = require("./schema");
const { pickFood } = require("./foodCatalog");
const {
  updatePlayerPhysics,
  checkCollisions,
  dist2,
  normalizeAngle,
  clamp,
  pushTrail,
} = require("./physics");

// Helper (now in physics.js but referenced here for random spawning)
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

class SnakeArenaRoom extends SnakeRoom {
  onCreate(options) {
    // Call base init to set defaults
    super.onCreate(options);
    
    // Override defaults for Arena
    this.maxClients = 120;
    this.respawnMs = 1200;
    this.foodCount = 34;
    
    this.state = new SnakeSharedState();
    this.state.status = "playing";
    this.state.gridW = 96;
    this.state.gridH = 56;
    
    // Re-initialize foods container if needed (SnakeRoom does this, but we want 34 foods)
    this.spawnFoods();
    
    // Use the base class simulation interval logic
    // We do NOT need to setSimulationInterval again if super.onCreate did it,
    // but SnakeRoom calls setSimulationInterval.
    // However, SnakeArenaRoom previously had its own loop.
    // We should rely on SnakeRoom's loop if possible, OR keep this one but make it use correct physics.
    
    // BETTER: Use SnakeRoom's update loop, which calls step().
    // We only need to override step() if Arena logic differs significantly (it doesn't for physics).
    // The only diff is "Arena" never ends (infinite respawn).
    
    // So we DON'T override update/step. We just let SnakeRoom handle it.
    // But we need to ensure "Match" logic (Game Over) doesn't kill the room.
    // In SnakeRoom, we check `shouldFinish`.
    // We can override `finishGame` to do nothing or check a flag.
  }

  // Override to prevent Game Over logic in Arena
  finishGame(winnerId) {
    // Arena never ends
  }

  // Use base spawnPlayer, or override if specific Arena spawn logic needed.
  // Original Arena had specific spawn logic? 
  // It used randomSpawnPoint. SnakeRoom also has randomSpawnPoint.
  
  // Let's Keep it simple: Delete all the duplicate logic and rely on SnakeRoom.
  // We only override what's different.
  
  spawnFoods() {
     // Arena has more food (34)
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

  // Arena uses "SnakeSharedState" which might differ from "SnakeState"?
  // Let's check schema.js.
  // If they are compatible, we are good.
  
  // Remove the entire duplicate update/step/onJoin/onLeave methods!
  // They are now inherited from SnakeRoom.
}

module.exports = { SnakeArenaRoom };
