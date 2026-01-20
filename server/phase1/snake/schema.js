const { Schema, MapSchema, ArraySchema, defineTypes } = require("@colyseus/schema");

class FoodState extends Schema {
  constructor(x = 0, y = 0, kind = "apple", rarity = "common") {
    super();
    this.x = x;
    this.y = y;
    this.kind = kind;
    this.rarity = rarity;
    this.power = "";
    this.seed = 0;
    this.spawnedAt = 0;
  }
}

defineTypes(FoodState, {
  x: "number",
  y: "number",
  kind: "string",
  rarity: "string",
  power: "string",
  seed: "int32",
  spawnedAt: "int64",
});

class SnakePlayerState extends Schema {
  constructor() {
    super();
    this.address = "";
    this.alive = true;
    this.score = 0;
    this.respawnAt = 0;
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
  }
}

defineTypes(SnakePlayerState, {
  address: "string",
  alive: "boolean",
  score: "int32",
  respawnAt: "int64",
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
});

class SnakeSharedState extends Schema {
  constructor() {
    super();
    this.players = new MapSchema();
    this.foods = new ArraySchema();
    this.status = "waiting";
    this.startedAt = 0;
    this.endedAt = 0;
    this.gridW = 48;
    this.gridH = 28;
  }
}

defineTypes(SnakeSharedState, {
  players: { map: SnakePlayerState },
  foods: [FoodState],
  status: "string",
  startedAt: "int64",
  endedAt: "int64",
  gridW: "int16",
  gridH: "int16",
});

module.exports = {
  ArraySchema,
  MapSchema,
  FoodState,
  SnakePlayerState,
  SnakeSharedState,
};
