import { clamp } from "./common.js";
import { Vector3 } from "./vector3.js";

export class Matrix3x3 {
  /**
   * @static
   * @param {Matrix3x3} m1
   * @param {Matrix3x3} m2
   */
  static addMatrix(m1, m2) {
    const m = new Matrix3x3();
    for (let i = 0; i < 3; i++)
      for (let j = 0; j < 3; j++)
        m.value[i][j] = m1.value[i][j] + m2.value[i][j];
    return m;
  }

  /**
   * @static
   * @param {Matrix3x3} m1 
   * @param {Matrix3x3} m2 
   */
  static multiplyMatrix(m1, m2) {
    const m = new Matrix3x3();
    for (let i = 0; i < 3; i++)
      for (let j = 0; j < 3; j++)
        for (let k = 0; k < 3; k++)
          m.value[i][j] = m.value[i][j] + m1.value[i][k]*m2.value[k][j];
    return m;
  }

  /**
   * @param {Matrix3x3} m 
   * @param {Vector3} v 
   * @returns {Vector3}
   */
  static multiplyVector3(m, v) {
    return new Vector3(
      m.value[0][0] * v.x + m.value[0][1] * v.y + m.value[0][2] * v.z,
      m.value[1][0] * v.x + m.value[1][1] * v.y + m.value[1][2] * v.z,
      m.value[2][0] * v.x + m.value[2][1] * v.y + m.value[2][2] * v.z,
    );
  }

  /**
   * @static
   * @param {Matrix3x3} m
   * @param {number} s
   */
  static multiplyScalar(m, s) {
    const newMatrix = new Matrix3x3();
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        newMatrix.value[i][j] = m.value[i][j] * s;
      }
    }
    return m;
  }

  /**
   * Interprets this matrix as a rotation matrix and produces euler angles from it.
   * @param {Matrix3x3} m 
   * @returns {Vector3}
   */
  static toEulerAngles(m) {
    const v = new Vector3();
    v.y = Math.asin(clamp(m.value[0][2], -1, 1));
    if (Math.abs(m.value[0][2]) < 0.99999999) {
      v.x = Math.atan2(-m.value[1][2], m.value[2][2]);
      v.z = Math.atan2(-m.value[0][1], m.value[0][0]);
    } else {
      v.x = Math.atan2(m.value[2][1], m.value[1][1]);
      v.z = 0;
    }
    return v;
  }

  /**
   * The identity matrix:  
   * 1 0 0  
   * 0 1 0  
   * 0 0 1
   * @returns {Matrix3x3} An identity matrix
   */
  static identity() {
    const m = new Matrix3x3();
    m.value = [[1,0,0],[0,1,0],[0,0,1]];
    return m;
  }

  /**
   * Returns a copy of the input matrix.
   * @param {Matrix3x3} m 
   * @returns {Matrix3x3} 
   */
  static copy(m) {
    const newMatrix = new Matrix3x3();
    for (let i = 0; i < 3; i++)
      for (let j = 0; j < 3; j++)
        newMatrix.value[i][j] = m.value[i][j];
    return newMatrix;
  }

  /** @type {number[][]} */
  value = [[0,0,0],[0,0,0],[0,0,0]];

  constructor() {}

  *[Symbol.iterator]() {
    for (let i = 0; i < 3; i++)
      for (let j = 0; j < 3; j++)
        yield this.value[i][j];
  }

  /**
   * Sets the value of this 3x3 Matrix.
   * @param {number[][]} value 
   * @returns {boolean} Success of the operation.
   */
  setValue(value) {
    if (value.length !== 3 || value[0].length !== 3) {
      return false;
    }
    this.value = value;
    return true;
  }

  /**
   * @param {Matrix3x3} m
   */
  addMatrix(m) {
    for (let i = 0; i < 3; i++)
      for (let j = 0; j < 3; j++)
        this.value[i][j] += m.value[i][j];
  }

  /** @param {number} s */
  multiplyScalar(s) {
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        this.value[i][j] = this.value[i][j] * s;  
      }
    }
  }

  /** Transposes this matrix. */
  transpose() {
    this.value[0].map((_, c) => this.value.map(r => r[c]));
  }

  /** Inverts this matrix. */
  invert() {
    const x = this.value[1][1] * this.value[2][2] - this.value[2][1] * this.value[1][2];
    const y = this.value[1][2] * this.value[2][0] - this.value[1][0] * this.value[2][2];
    const z = this.value[1][0] * this.value[2][1] - this.value[2][0] * this.value[1][1];
    const det = this.value[0][0] * x + this.value[0][1] * y + this.value[0][2] * z;
    if (det != 0) {
      this.value = [
        [x, this.value[0][2] * this.value[2][1] - this.value[0][1] * this.value[2][2], this.value[0][1] * this.value[1][2] - this.value[0][2] * this.value[1][1]],
        [y, this.value[0][0] * this.value[2][2] - this.value[0][2] * this.value[2][0], this.value[1][0] * this.value[0][2] - this.value[0][0] * this.value[1][2]],
        [z, this.value[2][0] * this.value[0][1] - this.value[0][0] * this.value[2][1], this.value[0][0] * this.value[1][1] - this.value[1][0] * this.value[0][1]]
      ].map(r => r.map(v => v /= det));
    }
  }
}