import { Component } from "../game/component.js";
import { Matrix3x3 } from "../math/matrix3x3.js";
import { Vector3 } from "../math/vector3.js";
import { Collider } from "./collider.js";

/** @constant @default */
export const COMP_RIGIDBODY = 'Rigidbody2D';

export class RigidbodyComponent extends Component {
  /** @type {Collider} */
  _collider;

  get collider() {
    return this._collider;
  }

  /** @param {Collider} c */
  set collider(c) {
    console.log('set!');
    if (this._collider) this._collider.rigidbody = undefined;
    this._collider = c;
    if (c) c.rigidbody = this;
  }

  // Constant quantities
  mass = 1;
  
  iBody = new Matrix3x3();
  iBodyInv = new Matrix3x3();

  // State variables
  position = new Vector3();
  orientation = Matrix3x3.identity();
  momentum = new Vector3();
  angularMomentum = new Vector3();

  // Derived quantities
  iInv = new Matrix3x3();
  velocity = new Vector3();
  angularVelocity = new Vector3();

  // Computed quantities
  force = new Vector3();
  torque = new Vector3();

  // properties
  kinematic = false;
  static = false;

  constructor() {
    super(COMP_RIGIDBODY);
    this.computeInertia();
  }

  /**
   * Applies a linear force (f) to this rigidbody.
   * @param {Vector3} f 
   */
  addLinearForce(f) {
    if (this.kinematic || this.static) return;
    this.force.addv3(f);
  }
  
  /**
   * Sets the mass of this rigidbody.  
   * This will cause this rigidbody to recalculate it's inertia.
   * @param {number} m 
   */
  setMass(m) {
    this.mass = m;
    this.computeInertia();
  }

  /**
   * Simulates this rigidbody for time t
   * @param {number} dt 
   */
  step(dt) {
    // Apply primitive forces
    this.momentum.addv3(this.force);
    this.force = new Vector3();

    this.angularMomentum.addv3(this.torque);
    this.torque = new Vector3();

    // Calculate velocities
    this.velocity = Vector3.divide(this.momentum, this.mass);

    const rT = Matrix3x3.copy(this.orientation);
    rT.transpose();
    this.iInv = Matrix3x3.multiplyMatrix(Matrix3x3.multiplyMatrix(this.orientation, rT), this.iBodyInv);

    this.angularVelocity = Matrix3x3.multiplyVector3(this.iInv, this.angularMomentum);

    // Apply velocities to spatial state
    this.position.addv3(Vector3.multiply(this.velocity, dt));
    const star = Vector3.star(this.angularVelocity);
    this.orientation.addMatrix(Matrix3x3.multiplyMatrix(star, this.orientation));
  }

  computeInertia() {
    if (this._collider) {
      // TODO Compute inertia based on collider
      this.iBody = Matrix3x3.multiplyScalar(Matrix3x3.identity(), 0.4 * this.mass);
    } else {
      this.iBody = Matrix3x3.multiplyScalar(Matrix3x3.identity(), 0.4 * this.mass);
    }
    this.iBodyInv = Matrix3x3.copy(this.iBody);
    this.iBodyInv.invert();
  }
}