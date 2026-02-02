export { SnakeSegment, PathPoint, Food, Player, GameState } from "../../../shared/schemas/GameState";


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
