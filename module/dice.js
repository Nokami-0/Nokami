// Shared dice helpers. Existing sheet roll behavior is preserved.
export async function rollShinobiTest(precision = 0, modifier = 0) {
  const roll = new Roll(`2d8 + ${Number(precision) || 0} + ${Number(modifier) || 0}`);
  await roll.evaluate();
  return roll;
}
export function shinobiDegree(diceTotal) {
  if (diceTotal <= 3) return "CRITICAL FAILURE (2-3)";
  if (diceTotal <= 8) return "DEGREE 1 (4-8)";
  if (diceTotal <= 11) return "DEGREE 2 (9-11)";
  if (diceTotal <= 14) return "DEGREE 3 (12-14)";
  return "CRITICAL HIT! DEGREE 4 (15-16)";
}
