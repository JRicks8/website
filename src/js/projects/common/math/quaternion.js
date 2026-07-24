import { Matrix3x3 } from "./matrix3x3.js";
import { Vector3 } from "./vector3.js";

export class Quaternion {
  /**
   * Returns the sum of the two quaternions.
   * @param {Quaternion} q1 
   * @param {Quaternion} q2 
   * @returns {Quaternion}
   */
  static add(q1, q2) {
    return new Quaternion(q1.w + q2.w, q1.x + q2.x, q1.y + q2.y, q1.z + q2.z);
  }

  /**
   * @see https://en.wikipedia.org/wiki/Quaternion#Hamilton_product
   * @param {Quaternion} a 
   * @param {Quaternion} b 
   * @returns {Quaternion}
   */
  static multiplyQuaternion(a, b) {
    const qaw = a.w, qax = a.x, qay = a.y, qaz = a.z;
		const qbw = b.w, qbx = b.x, qby = b.y, qbz = b.z;

    const res = new Quaternion(
      qaw * qbw - qax * qbx - qay * qby - qaz * qbz,
      qax * qbw + qaw * qbx + qay * qbz - qaz * qby,
      qay * qbw + qaw * qby + qaz * qbx - qax * qbz,
      qaz * qbw + qaw * qbz + qax * qby - qay * qbx
    );

		return res;
  }

  /**
   * @static
   * @param {Quaternion} q 
   * @param {Vector3} v 
   * @returns {Quaternion}
   */
  static multiplyVector(q, v) {
    return new Quaternion(
      -q.x * v.x - q.y * v.y - q.z * v.z,
      q.w * v.x + q.y * v.z - q.z * v.y,
      q.w * v.y + q.z * v.x - q.x * v.z,
      q.w * v.z + q.x * v.y - q.y * v.x
    );
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
    const v = q.normalized().v();
    m.value = [
      [1 - 2*(v.y*v.y) - 2*v.z*v.z, 2*v.x*v.y - 2*q.w*v.z, 2*v.x*v.z + 2*q.w*v.y],
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

  /**
   * Generates a pseudo-random quaternion.
   * @static
   * @returns {Quaternion}
   */
  static random() {
    const u = Math.random();
    const v = Math.random();
    const w = Math.random();
    return new Quaternion(
      Math.sqrt(1-u) * Math.sin(2*Math.PI*v),
      Math.sqrt(1-u) * Math.cos(2*Math.PI*v),
      Math.sqrt(u) * Math.sin(2*Math.PI*w),
      Math.sqrt(u) * Math.cos(2*Math.PI*w),
    );
  }

  /**
   * Spherical Linear Interpolation returns a new rotation interpolated between the two quaternions,
   * with respect to the four-dimensional space the quaternions lie in. Enables smooth rotations
   * between two quaternions.
   * @param {Quaternion} q1 
   * @param {Quaternion} q2 
   * @param {number} t 
   * @returns {Quaternion}
   */
  static slerp(q1, q2, t) {
    const theta = Quaternion.dot(q1.normalized(), q2.normalized());
    if (theta < 0) q2.multiplyScalar(-1);
    const v1 = Quaternion.multiplyScalar(q1, (Math.sin(1-t)*theta) / (Math.sin(theta)));
    const v2 = Quaternion.multiplyScalar(q2, (Math.sin(t*theta) / Math.sin(theta)));
    return Quaternion.add(v1, v2).normalized();
  }

  /**
   * Returns the dot product of q1 and q2.
   * @param {Quaternion} q1 
   * @param {Quaternion} q2 
   */
  static dot(q1, q2) {
    return q1.w * q2.w + q1.x * q2.x + q1.y * q2.y + q1.z * q2.z;
  }

  /** @type {number} */
  w;
  /** @type {number} */
  x;
  /** @type {number} */
  y;
  /** @type {number} */
  z;

  constructor(w = 1, x = 0, y = 0, z = 0) {
    this.w = w;
    this.x = x;
    this.y = y;
    this.z = z;
  }

  *[Symbol.iterator]() {
    yield this.w;
    yield this.x;
    yield this.y;
    yield this.z;
  }

  magnitude() {
    return Math.sqrt(this.w * this.w + this.x * this.x + this.y * this.y + this.z * this.z);
  }

  normalized() {
    const m = this.magnitude() || 1;
    return new Quaternion(this.w / m, this.x / m, this.y / m, this.z / m);
  }

  v() {
    return new Vector3(this.x, this.y, this.z);
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

    const w = this.w * q.w - this.x * q.x - this.y * q.y - this.z * q.z;
    const x = this.x * q.w + this.w * q.x + this.y * q.z - this.z * q.y;
    const y = this.y * q.w + this.w * q.y + this.z * q.x - this.x * q.z;
    const z = this.z * q.w + this.w * q.z + this.x * q.y - this.y * q.x;

    this.w = w;
    this.x = x;
    this.y = y;
    this.z = z;

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
    const m = this.magnitude() || 1;
    this.w /= m;
    this.x /= m;
    this.y /= m;
    this.z /= m;
  }

  /** @returns The inverse of this quaterion (w, -x, -y, -z) */
  inverse() {
    return new Quaternion(this.w, -this.x, -this.y, -this.z);
  }

  /**
   * Returns a copy of this quaternion
   * @returns {Quaternion}
   */
  getCopy() {
    return new Quaternion(this.w, this.x, this.y, this.z);
  }

  toString(sigFigs = 3) {
    const factor = Math.pow(10, sigFigs - 1);
    return `(${Math.round(this.w*factor)/factor}, ${Math.round(this.x*factor)/factor}, ${Math.round(this.y*factor)/factor}, ${Math.round(this.z*factor)/factor})`
  }
}