export class Vector2 {
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
    const m = this.magnitude;
    return new Vector2(this.x / m, this.y / m);
  }

  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }

  /**
   * Normalizes this vector, such that the magnitude equals 1.
   */
  normalize() {
    const m = this.magnitude;
    this.x /= m;
    this.y /= m;
  }

  /**
   * @param {Vector2} other
   * @returns {boolean}
   */
  equals(other) {
    return this.x === other.x && this.y === other.y;
  }
}