import { Matrix3x3 } from "./matrix3x3.js";
import { Vector2 } from "./vector2.js";

export class Vector3 {
  static get one() { return new Vector3(1, 1, 1); }
  static get up() { return new Vector3(0, 1, 0); }
  static get down() { return new Vector3(0, -1, 0); }
  static get right() { return new Vector3(1, 0, 0); }
  static get left() { return new Vector3(-1, 0, 0); }
  static get forward() { return new Vector3(0, 0, 1); }
  static get back() { return new Vector3(0, 0, -1); }

  /**
   * @static
   * @param {Vector3} v1
   * @param {Vector2} v2
   * @returns {Vector3}
   */
  static addv2(v1, v2) {
    return new Vector3(v1.x + v2.x, v1.y + v2.y, v1.z);
  }

  /**
   * @static
   * @param {Vector3} v1
   * @param {Vector3} v2
   * @returns {Vector3}
   */
  static addv3(v1, v2) {
    return new Vector3(v1.x + v2.x, v1.y + v2.y, v1.z + v2.z);
  }

  /**
   * @static
   * @param {Vector3} v1 
   * @param {Vector3} v2 
   * @returns v2 subtracted from v1
   */
  static subtract(v1, v2) {
    return new Vector3(v1.x - v2.x, v1.y - v2.y, v1.z - v2.z);
  }

  /**
   * @static
   * @param {Vector3} v 
   * @param {number} n 
   * @returns {Vector3}
   */
  static multiply(v, n) {
    return new Vector3(v.x * n, v.y * n, v.z * n);
  }

  /**
   * @static
   * @param {Vector3} v 
   * @param {number} n 
   * @returns {Vector3}
   */
  static divide(v, n) {
    return new Vector3(v.x / n, v.y / n, v.z / n);
  }

  /**
   * Performs the star operation.
   * @see https://en.wikipedia.org/wiki/Infinitesimal_rotation_matrix
   * @param {Vector3} v 
   * @returns {Matrix3x3}
   */
  static star(v) {
    const m = new Matrix3x3();
    m.value = [[0, -v.z, v.y],[v.z, 0, -v.x],[-v.y, v.x, 0]];
    return m;
  }

  /** @type {number} */
  x;

  /** @type {number} */
  y;

  /** @type {number} */
  z;

  get magnitude() {
    return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
  }

  get sqrMagnitude() {
    return this.x * this.x + this.y * this.y + this.z * this.z;
  }

  get normalized() {
    const m = this.magnitude;
    return new Vector3(this.x / m, this.y / m, this.z / m);
  }

  constructor(x = 0, y = 0, z = 0) {
    this.x = x;
    this.y = y;
    this.z = z;
  }

  *[Symbol.iterator]() {
    yield this.x;
    yield this.y;
    yield this.z;
  }

  /**
   * Adds the components of v to this vector.
   * @param {Vector3} v 
   */
  addv3(v) {
    this.x += v.x;
    this.y += v.y;
    this.z += v.z;
  }

  /**
   * Adds the components of v to this vector.
   * @param {Vector2} v 
   */
  addv2(v) {
    this.x += v.x;
    this.y += v.y;
  }

  /**
   * @param {number} n 
   */
  multiply(n) {
    this.x *= n;
    this.y *= n;
    this.z *= n;
  }

  /**
   * Divides this vector by scalar n
   * @param {number} n 
   */
  divide(n) {
    this.x /= n;
    this.y /= n;
    this.z /= n;
  }

  /**
   * Normalizes this vector, such that the magnitude equals 1.
   */
  normalize() {
    const m = this.magnitude;
    this.x /= m;
    this.y /= m;
    this.z /= m;
  }

  /**
   * @param {Vector3} that
   * @returns {boolean}
   */
  equals(that) {
    return this.x === that.x && this.y === that.y && this.z === that.z;
  }
}