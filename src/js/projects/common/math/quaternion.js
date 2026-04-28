import { Matrix3x3 } from "./matrix3x3.js";
import { Vector3 } from "./vector3.js";

export class Quaternion {
  /**
   * @see https://en.wikipedia.org/wiki/Quaternion#Hamilton_product
   * @param {Quaternion} q1 
   * @param {Quaternion} q2 
   * @returns {Quaternion}
   */
  static multiplyQuaternion(q1, q2) {
    const q1w = q1.w, q1x = q1.x, q1y = q1.y, q1z = q1.z;
		const q2w = q2.w, q2x = q2.x, q2y = q2.y, q2z = q2.z;

    const res = new Quaternion(
      q1w * q2w - q1x * q2x - q1y * q2y - q1z * q2z,
      q1x * q2w + q1w * q2x + q1y * q2z - q1z * q2y,
      q1y * q2w + q1w * q2y + q1z * q2x - q1x * q2z,
      q1z * q2w + q1w * q2z + q1x * q2y - q1y * q2x
    );

		return res;
  }

  /**
   * @static
   * @param {Quaternion} q 
   * @param {number} s 
   * @returns {Quaternion}
   */
  static multiplyScalar(q, s) {
    return new Quaternion(q.w * s, q.x * s, q.y * s, q.z * s);
  }

  /**
   * @static
   * @param {Quaternion} q 
   * @param {number} s 
   * @returns {Quaternion}
   */
  static divideScalar(q, s) {
    return new Quaternion(q.w / s, q.x / s, q.y / s, q.z / s);
  }

  /**
   * @static
   * @param {Quaternion} q
   * @returns {Matrix3x3}
   */
  static toMatrix(q) {
    const m = new Matrix3x3();
    const v = q.v;
    m.value = [
      [1 - 2*v.y*v.y - 2*v.z*v.z, 2*v.x*v.y - 2*q.w*v.z, 2*v.x*v.z + 2*q.w*v.y],
      [2*v.x*v.y + 2*q.w*v.z, 1 - 2*v.x*v.x - 2*v.z*v.z, 2*v.y*v.z - 2*q.w*v.x],
      [2*v.x*v.z - 2*q.w*v.y, 2*v.y*v.z + 2*q.w*v.x, 1 - 2*v.x*v.x - 2*v.y*v.y]
    ];
    return m;
  }

  /**
   * @static
   * @param {Quaternion} q
   * @returns {Vector3}
   */
  static toEulerAngles(q) {
    const v = new Vector3(
      Math.atan2(2 * (q.w * q.x + q.y * q.z), 1 - 2 * (q.x * q.x + q.y * q.y)),
      2 * Math.atan2(Math.sqrt(1 + 2 * (q.w * q.y - q.x * q.z)), Math.sqrt(1 - 2 * (q.w * q.y - q.x * q.z))) - Math.PI / 2,
      Math.atan2(2 * (q.w * q.z + q.x * q.y), 1 - 2 * (q.y * q.y + q.z * q.z))
    );
    v.multiply(180 / Math.PI);
    return v;
  }

  /** @type {number} */
  w;
  /** @type {number} */
  x;
  /** @type {number} */
  y;
  /** @type {number} */
  z;

  get v() {
    return new Vector3(this.x, this.y, this.z);
  }

  get magnitude() {
    return Math.sqrt(this.w * this.w + this.x * this.x + this.y * this.y + this.z * this.z);
  }

  get normalized() {
    const m = this.magnitude || 1;
    return new Quaternion(this.w / m, this.x / m, this.y / m, this.z / m);
  }

  constructor(w = 1, x = 0, y = 0, z = 0) {
    this.w = w;
    this.x = x;
    this.y = y;
    this.z = z;
  }

  /**
   * @param {number} w 
   * @param {number} x 
   * @param {number} y 
   * @param {number} z 
   */
  set(w, x, y, z) {
    this.w = w;
    this.x = x;
    this.y = y;
    this.z = z;
  }

  /**
   * @param {Quaternion} q
   */
  setv4(q) {
    this.w = q.w;
    this.x = q.x;
    this.y = q.y;
    this.z = q.z;
  }

  /** 
   * @param {Quaternion} q 
   * @returns {this}
   */
  add(q) {
    this.w += q.w;
    this.x += q.x;
    this.y += q.y;
    this.z += q.z;
    return this;
  }

  /** 
   * @see https://en.wikipedia.org/wiki/Quaternion#Hamilton_product
   * @param {Quaternion} q 
   * @returns {this}
   */
  multiplyQuaternion(q) {
    this.w = this.w * q.w - this.x * q.x - this.y * q.y - this.z * q.z,
    this.x = this.x * q.w + this.w * q.x + this.y * q.z - this.z * q.y,
    this.y = this.y * q.w + this.w * q.y + this.z * q.x - this.x * q.z,
    this.z = this.z * q.w + this.w * q.z + this.x * q.y - this.y * q.x

		return this;
  }

  /** 
   * @param {number} s 
   * @returns {this}
   */
  multiplyScalar(s) {
    this.w *= s;
    this.x *= s;
    this.y *= s;
    this.z *= s;
    return this;
  }

  /** @param {number} s */
  divideScalar(s) {
    this.w /= s;
    this.x /= s;
    this.y /= s;
    this.z /= s;
  }

  normalize() {
    const m = this.magnitude || 1;
    this.w /= m;
    this.x /= m;
    this.y /= m;
    this.z /= m;
  }

  /** @returns The inverse of this quaterion (w, -x, -y, -z) */
  inverse() {
    return new Quaternion(this.w, -this.x, -this.y, -this.z);
  }
}