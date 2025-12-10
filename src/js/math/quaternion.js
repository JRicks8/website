import { Matrix3x3 } from "./matrix3x3.js";
import { Vector3 } from "./vector3.js";

export class Quaternion {
  /**
   * @param {Quaternion} q1 
   * @param {Quaternion} q2 
   * @returns {Quaternion}
   */
  static multiplyQuaternion(q1, q2) {
    const v1 = q1.v;
    const v2 = q2.v;
    const v = Vector3.addv3(Vector3.multiply(v2, q1.w), Vector3.multiply(v1, q2.w), Vector3.cross(v1, v2));
    return new Quaternion(q1.w * q2.w - Vector3.dot(v1, v2), ...v);
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

  /** @param {Quaternion} q */
  add(q) {
    this.w += q.w;
    this.x += q.x;
    this.y += q.y;
    this.z += q.z;
  }

  /** @param {Quaternion} q */
  multiplyQuaternion(q) {
    const v1 = this.v;
    const v2 = q.v;
    let v = Vector3.multiply(v2, this.w);
    v.addv3(Vector3.multiply(v1, q.w));
    v.addv3(v1);
    v = Vector3.cross(v, v2);

    this.w = this.w * q.w - Vector3.dot(v1, q.v);
    this.x = v.x;
    this.y = v.y;
    this.z = v.z;
  }

  /** @param {number} s */
  multiplyScalar(s) {
    this.w *= s;
    this.x *= s;
    this.y *= s;
    this.z *= s;
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
}