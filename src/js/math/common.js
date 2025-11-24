/**
 * @param {number} n 
 * @param {number} min 
 * @param {number} max 
 * @returns Input value n restricted to the input minimum and maximum values.
 */
export function clamp(n, min, max) {
  if (n < min) n = min;
  else if (n > max) n = max;
  return n;
}