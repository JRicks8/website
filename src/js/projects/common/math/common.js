import { MIN_DISTANCE } from "../collision/narrow-phase/continuous-convex.js";

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

/**
 * @param {number} n 
 * @param {number} min 
 * @param {number} max 
 * @returns Input value n restricted to the input minimum and maximum values, and the value wraps around 
 * if it exceeds the boundaries.
 */
export function clampWrap(n, min, max) {
  if (n < min) n += max - min;
  else if (n > max) n -= max - min;
  return n;
}

/**
 * Converts radians to degrees
 * @param {number} r 
 */
export function toDegrees(r) {
  return r * 57.295779;
}

/**
 * Converts degrees to radians
 * @param {number} d
 */
export function toRadians(d) {
  return d / 57.295779;
}

/**
 * Returns the sign of n
 * @param {number} n 
 * @returns {-1 | 1 | 0}
 */
export function sign(n) {
  return n ? n < 0 ? -1 : 1 : 0;
}

/**
 * Returns the sign of n with respect to the MIN_DISTANCE
 * @param {number} n 
 * @returns {-1 | 1 | 0}
 */
export function cdSign(n) {
  if (Math.abs(n) < MIN_DISTANCE) return 0;
  else if (n < 0) return -1;
  return 1;
}