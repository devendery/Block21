import { Food } from "../../shared/schemas/GameState";

export type FoodTypeDef = {
  kind: number;
  points: number;
  segments: number;
  mass: number;
  chance: number;
};

export class FoodSystem {
  private readonly types: FoodTypeDef[];

  constructor(types?: FoodTypeDef[]) {
    this.types =
      types ??
      [
        { kind: 0, points: 100, segments: 0, mass: 0.2, chance: 0.7 },
        { kind: 1, points: 300, segments: 0, mass: 0.6, chance: 0.2 },
        { kind: 2, points: 1000, segments: 0, mass: 1.5, chance: 0.08 },
        { kind: 3, points: 500, segments: 0, mass: 1.0, chance: 0.02 },
      ];
  }

  createFood(x: number, y: number): Food {
    const type = this.selectRandomType();
    const food = new Food();
    food.x = x;
    food.y = y;
    food.kind = type.kind;
    food.points = type.points;
    food.segments = type.segments;
    food.mass = type.mass;
    return food;
  }

  private selectRandomType(): FoodTypeDef {
    const r = Math.random();
    let cumulative = 0;
    for (let i = 0; i < this.types.length; i++) {
      cumulative += this.types[i].chance;
      if (r <= cumulative) return this.types[i];
    }
    return this.types[0];
  }
}
