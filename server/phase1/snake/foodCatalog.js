const COMMON_FOODS = [
  "apple",
  "banana",
  "orange",
  "mango",
  "strawberry",
  "grape",
  "watermelon",
  "pineapple",
  "kiwi",
  "carrot",
  "tomato",
  "broccoli",
  "corn",
  "chili",
  "mushroom",
  "pumpkin",
  "potato",
];

const SPECIAL_FOODS = {
  golden: ["golden_apple"],
  rare: ["glowing_berry", "energy_fruit"],
  epic: ["crystal_vegetable"],
};

const EPIC_POWERS = ["speed", "magnet", "shield", "double"];

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pruneTimes(times, now, windowMs) {
  while (times.length > 0 && now - times[0] > windowMs) times.shift();
}

function chooseRarity(now, caps) {
  pruneTimes(caps.rareTimes, now, 60_000);
  pruneTimes(caps.epicTimes, now, 60_000);
  pruneTimes(caps.goldenTimes, now, 120_000);

  const canGolden = caps.goldenTimes.length < 1;
  const canEpic = caps.epicTimes.length < 4;
  const canRare = caps.rareTimes.length < 10;

  const r = Math.random();
  if (canGolden && r < 0.002) return "golden";
  if (canEpic && r < 0.012) return "epic";
  if (canRare && r < 0.07) return "rare";
  return "common";
}

function pickFood(now, caps) {
  const rarity = chooseRarity(now, caps);
  if (rarity === "golden") {
    caps.goldenTimes.push(now);
    return { kind: SPECIAL_FOODS.golden[0], rarity, power: "" };
  }
  if (rarity === "epic") {
    caps.epicTimes.push(now);
    return {
      kind: SPECIAL_FOODS.epic[randomInt(0, SPECIAL_FOODS.epic.length - 1)],
      rarity,
      power: EPIC_POWERS[randomInt(0, EPIC_POWERS.length - 1)],
    };
  }
  if (rarity === "rare") {
    caps.rareTimes.push(now);
    return { kind: SPECIAL_FOODS.rare[randomInt(0, SPECIAL_FOODS.rare.length - 1)], rarity, power: "" };
  }
  return { kind: COMMON_FOODS[randomInt(0, COMMON_FOODS.length - 1)], rarity, power: "" };
}

module.exports = {
  COMMON_FOODS,
  EPIC_POWERS,
  pickFood,
};

