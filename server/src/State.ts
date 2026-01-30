import { Schema, type, MapSchema, ArraySchema } from "@colyseus/schema";
import { PhysicsConfig } from "./Physics";

export class SnakeSegment extends Schema {
    @type("number") x: number = 0;
    @type("number") y: number = 0;
}

export class PathPoint extends Schema {
    @type("number") x: number = 0;
    @type("number") y: number = 0;
}

export class Player extends Schema {
    @type("string") id: string = "";
    @type("string") name: string = "";
    @type("number") x: number = 0;
    @type("number") y: number = 0;
    @type("number") angle: number = 0;
    @type("boolean") alive: boolean = true;
    @type("number") score: number = 0;
    @type("number") speed: number = 0;
    @type("boolean") isBoosting: boolean = false;
    @type("number") length: number = 0;
    @type("number") skin: number = 0; // 0 to N skin ID
    @type("number") lastAckInputSeq: number = 0;
    
    // Physics State (Not synced, but used for logic)
    dirX: number = 1;
    dirY: number = 0;
    history: {x: number, y: number}[] = [];

    @type([SnakeSegment]) segments = new ArraySchema<SnakeSegment>();

    @type([PathPoint]) pathPoints = new ArraySchema<PathPoint>();
}

export class Food extends Schema {
    @type("number") x: number = 0;
    @type("number") y: number = 0;
    @type("number") value: number = 1;
}

export class GameState extends Schema {
    @type("number") mapSize: number = 3000;
    @type({ map: Player })
    players: MapSchema<Player> = new MapSchema<Player>();

    @type({ map: Food }) 
    food: MapSchema<Food> = new MapSchema<Food>();
}


// export class GameState extends Schema {
//   @type("number") mapSize: number = 3000;
//   @type({ map: Player }) players = new MapSchema<Player>();
//   @type({ map: Food }) food = new MapSchema<Food>();
// }

// console.log("SERVER SCHEMA:", {
//   GameState: GameState.name,
//   Player: Player.name,
//   SnakeSegment: SnakeSegment.name,
//   Food: Food.name,
// });
