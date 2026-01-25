import { Schema, type, MapSchema, ArraySchema } from "@colyseus/schema";

export class SnakeSegment extends Schema {
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

  @type([SnakeSegment]) segments = new ArraySchema<SnakeSegment>();
}

export class Food extends Schema {
  @type("number") x: number = 0;
  @type("number") y: number = 0;
  @type("number") value: number = 1;
}

export class GameState extends Schema {
  @type("number") mapSize: number = 3000;
  @type({ map: Player }) players = new MapSchema<Player>();
  @type({ map: Food }) food = new MapSchema<Food>();
}
