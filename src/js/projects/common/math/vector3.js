import { Matrix3x3 } from "./matrix3x3.js";
import { Quaternion } from "./quaternion.js";
import { Vector2 } from "./vector2.js";

/** 
 * @typedef Vector3Like
 * @property {number} x
 * @property {number} y
 * @property {number} z
 */

export class Vector3 {
  static get one() { return new Vector3(1, 1, 1); }
  static get up() { return new Vector3(0, 1, 0); }
  static get down() { return new Vector3(0, -1, 0); }
  static get right() { return new Vector3(1, 0, 0); }
  static get left() { return new Vector3(-1, 0, 0); }
  static get forward() { return new Vector3(0, 0, -1); }
  static get back() { return new Vector3(0, 0, 1); }

  /**
   * @static
   * @param {Vector3Like} v1
   * @param {Vector3Like} v2
   * @returns {Vector3}
   */
  static addv2(v1, v2) {
    return new Vector3(v1.x + v2.x, v1.y + v2.y, v1.z);
  }

  /**
   * @static
   * @param {Vector3Like[]} vectors
   * @returns {Vector3}
   */
  static addv3(...vectors) {
    const res = new Vector3();
    vectors.forEach(v => {
      res.x += v.x;
      res.y += v.y;
      res.z += v.z;
    });
    return res;
  }

  /**
   * @static
   * @param {Vector3Like} v1 
   * @param {Vector3Like} v2 
   * @returns v2 subtracted from v1
   */
  static subtract(v1, v2) {
    return new Vector3(v1.x - v2.x, v1.y - v2.y, v1.z - v2.z);
  }

  /**
   * @static
   * @param {Vector3Like} v 
   * @param {number[]} ns
   * @returns {Vector3}
   */
  static multiply(v, ...ns) {
    const res = new Vector3().copy(v);
    for (const n of ns) {
      res.x *= n;
      res.y *= n;
      res.z *= n;
    }
    return res;
  }

  /**
   * @static
   * @param {Vector3Like} v 
   * @param {number} n 
   * @returns {Vector3}
   */
  static divide(v, n) {
    return new Vector3(v.x / n, v.y / n, v.z / n);
  }

  /**
   * @static
   * @param {Vector3Like} v1
   * @param {Vector3Like} v2
   * @returns {number}
   */
  static dot(v1, v2) {
    return v1.x * v2.x + v1.y * v2.y + v1.z * v2.z;
  }

  /**
   * @static
   * @param {Vector3Like} v1
   * @param {Vector3Like} v2
   * @returns {Vector3}
   */
  static cross(v1, v2) {
    return new Vector3(
      v1.y * v2.z - v1.z * v2.y,
      v1.z * v2.x - v1.x * v2.z,
      v1.x * v2.y - v1.y * v2.x
    );
  }

  /**
   * Performs the star operation.
   * @see https://en.wikipedia.org/wiki/Infinitesimal_rotation_matrix
   * @param {Vector3Like} v 
   * @returns {Matrix3x3}
   */
  static star(v) {
    const m = new Matrix3x3();
    m.value = [[0, -v.z, v.y],[v.z, 0, -v.x],[-v.y, v.x, 0]];
    return m;
  }

  /**
   * Rotates v by the quaternion q and returns a new Vector3 with the result, normalized.
   * @see https://math.stackexchange.com/questions/40164/how-do-you-rotate-a-vector-by-a-unit-quaternion
   * @param {Vector3Like} v
   * @param {Quaternion} q 
   * @returns {Vector3}
   */
  static rotate(v, q) {
    return Quaternion.multiplyQuaternion(q, new Quaternion(0, v.x, v.y, v.z))
      .multiplyQuaternion(new Quaternion(q.w, -q.x, -q.y, -q.z)).v;
  }

  /**
   * Returns the result of projecting v1 onto v2.
   * @param {Vector3} v1 
   * @param {Vector3} v2 
   * @returns {Vector3}
   */
  static project(v1, v2) {
    return Vector3.multiply(
      v2,
      Vector3.dot(v1, v2) / v2.sqrMagnitude
    );
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
    if (m === 0) return new Vector3();
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
   * @param {number} x 
   * @param {number} y 
   * @param {number} z 
   */
  set(x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;
  }

  /**
   * Sets the x component of this vector
   * @param {number} x 
   */
  setX(x) {
    this.x = x;
  }

  /**
   * Sets the y component of this vector
   * @param {number} y 
   */
  setY(y) {
    this.y = y;
  }

  /**
   * Sets the z component of this vector
   * @param {number} z 
   */
  setZ(z) {
    this.z = z;
  }

  /**
   * Copies the components of v to this vector
   * @param {Vector3Like} v 
   * @returns This vector
   */
  copy(v) {
    this.x = v.x;
    this.y = v.y;
    this.z = v.z;
    return this;
  }

  /**
   * 
   * @param {Vector3Like} v 
   * @returns True if the components of v are equal to the components of this vector
   */
  equals(v) {
    return this.x === v.x && this.y === v.y && this.z === v.z;
  }

  /**
   * @param {Vector3Like} v 
   */
  setv3(v) {
    this.x = v.x;
    this.y = v.y;
    this.z = v.z;
  }

  /**
   * Adds the components of v to this vector.
   * @param {Vector3Like[]} vectors
   * @returns {this}
   */
  addv3(...vectors) {
    vectors.forEach(v => {
      this.x += v.x;
      this.y += v.y;
      this.z += v.z;
    });
    return this;
  }

  /**
   * Subtracts the components of v from this vector.
   * @param {Vector3Like} v 
   */
  subtractv3(v) {
    this.x -= v.x;
    this.y -= v.y;
    this.z -= v.z;
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
   * @param {number[]} ns
   * @returns {this}
   */
  multiply(n, ...ns) {
    this.x *= n;
    this.y *= n;
    this.z *= n;
    ns.forEach(m => {
      this.x *= m;
      this.y *= m;
      this.z *= m;
    });
    return this;
  }

  /**
   * Divides this vector by scalar n
   * @param {number} n 
   * @returns {this}
   */
  divide(n) {
    this.x /= n;
    this.y /= n;
    this.z /= n;
    return this;
  }

  /**
   * Normalizes this vector, such that the magnitude equals 1.
   * @returns {this}
   */
  normalize() {
    const m = this.magnitude || 1;
    this.x /= m;
    this.y /= m;
    this.z /= m;
    return this;
  }

  /**
   * Returns the distance between this vector and v, squared.
   * @param {Vector3Like} v 
   */
  distanceToSquared(v) {
    const dx = v.x - this.x;
    const dy = v.y - this.y;
    const dz = v.z - this.z;
		return dx * dx + dy * dy + dz * dz;
  }

  /**
   * Returns the distance between this vector and v.
   * @param {Vector3Like} v 
   */
  distanceTo(v) {
    return Math.sqrt(this.distanceToSquared(v));
  }

  /**
   * Rotates this vector by the quaternion q. This vector is assumed to be normalized.
   * @param {Quaternion} q 
   * @returns {this}
   */
  rotate(q) {
    const res = Quaternion.multiplyQuaternion(q, new Quaternion(0, this.x, this.y, this.z))
      .multiplyQuaternion(q.inverse());
    this.x = res.x;
    this.y = res.y;
    this.z = res.z;
    return this;
  }

  /**
   * Projects this vector onto v
   * @param {Vector3} v 
   */
  project(v) {
    const m = v.sqrMagnitude;
    if (m === 0) {
      this.set(0, 0, 0);
      return;
    }
    this.copy(Vector3.multiply(v, Vector3.dot(this, v) / m));
  }

  toString(sigFigs = 3) {
    const factor = Math.pow(10, sigFigs - 1);
    return `(${Math.round(this.x*factor)/factor}, ${Math.round(this.y*factor)/factor}, ${Math.round(this.z*factor)/factor})`
  }
}