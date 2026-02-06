import { angleDifference } from "../src/Physics";

function degToRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

function radToDeg(rad: number): number {
  return (rad * 180) / Math.PI;
}

export function testAngleDifference() {
  const testCases = [
    { a: degToRad(170), b: degToRad(-170), expected: degToRad(20) },
    { a: degToRad(-170), b: degToRad(170), expected: degToRad(-20) },
    { a: degToRad(179), b: degToRad(-179), expected: degToRad(2) },
    { a: degToRad(0), b: degToRad(359), expected: degToRad(-1) },
  ];

  console.log("Testing angleDifference fix:");
  testCases.forEach((tc, i) => {
    const result = angleDifference(tc.a, tc.b);
    const diffRad = Math.abs(result - tc.expected);
    const diffDeg = radToDeg(diffRad);

    if (diffDeg < 1) {
      console.log(`✓ Test ${i + 1} passed (error: ${diffDeg.toFixed(2)}°)`);
    } else {
      console.log(
        `✗ Test ${i + 1} FAILED: got ${radToDeg(result).toFixed(2)}°, expected ${radToDeg(tc.expected).toFixed(2)}°`
      );
    }
  });
}

if (require.main === module) {
  testAngleDifference();
}
