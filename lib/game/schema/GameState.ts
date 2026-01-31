import { Schema, type, MapSchema, ArraySchema } from "@colyseus/schema";

const g = globalThis as any;

// Declare exports (types + values)
let SnakeSegment: typeof Schema;
let PathPoint: typeof Schema;
let Player: typeof Schema;
let Food: typeof Schema;
let GameState: typeof Schema;

if (g.__COLYSEUS_SCHEMA_CACHE__) {
  // 🔁 HMR reload: reuse existing constructors
  ({ SnakeSegment, PathPoint, Player, Food, GameState } = g.__COLYSEUS_SCHEMA_CACHE__);
} else {
  // ✅ First load: define schema ONCE

  class SnakeSegmentDef extends Schema {
    @type("number") x: number = 0;
    @type("number") y: number = 0;
  }

  class PathPointDef extends Schema {
    @type("number") x: number = 0;
    @type("number") y: number = 0;
  }

  class PlayerDef extends Schema {
    @type("string") id: string = "";
    @type("string") name: string = "";
    @type("number") x: number = 0;
    @type("number") y: number = 0;
    @type("number") angle: number = 0;
    @type("boolean") alive: boolean = true;
    @type("number") score: number = 0;
    @type("number") speed: number = 0;
    @type("number") length: number = 0;
    @type("number") radius: number = 21;
    
    // Physics State (Not synced, but used for logic)
    dirX: number = 1;
    dirY: number = 0;
    history: {x: number, y: number}[] = [];

    @type([SnakeSegmentDef]) segments = new ArraySchema<SnakeSegmentDef>();
    @type([PathPointDef]) pathPoints = new ArraySchema<PathPointDef>();
  }

  class FoodDef extends Schema {
    @type("number") x: number = 0;
    @type("number") y: number = 0;
    @type("number") value: number = 1;
  }

  class GameStateDef extends Schema {
    @type("number") mapSize: number = 3000;
    @type({ map: PlayerDef }) players = new MapSchema<PlayerDef>();
    @type({ map: FoodDef }) food = new MapSchema<FoodDef>();
  }

  // Assign exports
  SnakeSegment = SnakeSegmentDef;
  PathPoint = PathPointDef;
  Player = PlayerDef;
  Food = FoodDef;
  GameState = GameStateDef;

  // Cache globally for HMR
  g.__COLYSEUS_SCHEMA_CACHE__ = {
    SnakeSegment,
    PathPoint,
    Player,
    Food,
    GameState,
  };
}

// ✅ Normal named exports (types + values work)
export { SnakeSegment, PathPoint, Player, Food, GameState };

console.log("CLIENT SCHEMA:", {
  GameState: GameState.name,
  Player: Player.name,
  SnakeSegment: SnakeSegment.name,
  PathPoint: PathPoint.name,
  Food: Food.name,
});
