/** 
 * @typedef Vector2Like
 * @property {number} x
 * @property {number} y
 */

export class Vector2 {
  static get one() { return new Vector2(1, 1); }
  static get zero() { return new Vector2(); }
  static get up() { return new Vector2(0, 1); }
  static get down() { return new Vector2(0, -1); }
  static get right() { return new Vector2(1, 0); }
  static get left() { return new Vector2(-1, 0); }

  /**
   * @param {Vector2Like} v1
   * @param {Vector2Like} v2
   * @returns {Vector2}
   */
  static add(v1, v2) {
    return new Vector2(v1.x + v2.x, v1.y + v2.y);
  }

  /**
   * @param {Vector2Like} v1 
   * @param {Vector2Like} v2 
   * @returns v2 subtracted from v1
   */
  static subtract(v1, v2) {
    return new Vector2(v1.x - v2.x, v1.y - v2.y);
  }

  /**
   * @param {Vector2Like} v 
   * @param {number} n 
   * @returns {Vector2}
   */
  static multiply(v, n) {
    return new Vector2(v.x * n, v.y * n);
  }

  /**
   * 
   * @param {Vector2Like} v 
   * @param {number} n 
   * @returns {Vector2}
   */
  static divide(v, n) {
    return new Vector2(v.x / n, v.y / n);
  }

  /**
   * @param {number} angle Angle in radians
   * @returns {Vector2} 
   */
  static fromAngle(angle) {
    return new Vector2(Math.cos(angle), Math.sin(angle));
  }

  /** @type {number} */
  x;

  /** @type {number} */
  y;

  get magnitude() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  get sqrMagnitude() {
    return this.x * this.x + this.y * this.y;
  }

  get normalized() {
    const m = this.magnitude || 1;
    return new Vector2(this.x / m, this.y / m);
  }

  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }

  *[Symbol.iterator]() {
    yield this.x;
    yield this.y;
  }

  /**
   * Sets the components of this vector.
   * @param {number} x
   * @param {number} y
   */
  set(x, y) {
    this.x = x;
    this.y = y;
  }

  /**
   * Sets the components of this vector to match v.
   * @param {Vector2Like} v 
   */
  setv2(v) {
    this.x = v.x;
    this.y = v.y;
  }

  /**
   * Multiplies this vector by the given scalar n.
   * @param {number} n 
   */
  multiply(n) {
    this.x *= n;
    this.y *= n;
  }

  /**
   * Normalizes this vector, such that the magnitude equals 1.
   */
  normalize() {
    const m = this.magnitude || 1;
    this.x /= m;
    this.y /= m;
  }

  /**
   * @param {Vector2Like} other
   * @returns {boolean}
   */
  equals(other) {
    return this.x === other.x && this.y === other.y;
  }
}