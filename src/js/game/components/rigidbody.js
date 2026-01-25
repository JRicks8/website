import { Component } from "./component.js";
import { Matrix3x3 } from "../../math/matrix3x3.js";
import { Vector3 } from "../../math/vector3.js";
import { Collider } from "../../physics/collider.js";
import { BodyState } from "../../physics/body-state.js";

let idCounter = 0;

/** @constant @default */
export const COMP_RIGIDBODY = 'Rigidbody';

export class RigidbodyComponent extends Component {
  /** @private @type {Collider} */
  _collider;

  get collider() {
    return this._collider;
  }

  /** @param {Collider} c */
  set collider(c) {
    if (this._collider) this._collider.parent = undefined;
    this._collider = c;
    if (c) c.parent = this;
  }

  id;

  bodyState = new BodyState();
  cachedState = new BodyState();

  iBody = new Matrix3x3();

  // properties
  /** Ignored during collision checks */
  noCollide = false;
  /** True if no forces should act on this object (velocities can still be set) */
  noForces = false;

  constructor() {
    super(COMP_RIGIDBODY);
    this.id = idCounter++;
    this._collider = new Collider();
    this.computeInertia();
  }

  /**
   * Applies a linear force (f) to this rigidbody.
   * @param {Vector3} f 
   */
  addLinearForce(f) {
    this.bodyState.force.addv3(f);
  }

  /**
   * Applies a torque (f) to this rigidbody.
   * @param {Vector3} f 
   */
  addTorque(f) {
    this.bodyState.torque.addv3(f);
  }
  
  /**
   * Sets the mass of this rigidbody.  
   * This will cause this rigidbody to recalculate it's inertia.
   * @param {number} m 
   */
  setMass(m) {
    this.bodyState.mass = m;
    this.computeInertia();
  }

  computeInertia() {
    if (this._collider) {
      // TODO Compute inertia based on collider
      this.iBody = Matrix3x3.multiplyScalar(Matrix3x3.identity(), 0.4 * this.bodyState.mass);
    } else {
      this.iBody = Matrix3x3.multiplyScalar(Matrix3x3.identity(), 0.4 * this.bodyState.mass);
    }
    this.bodyState.iBodyInv = Matrix3x3.copy(this.iBody);
    this.bodyState.iBodyInv.invert();
  }

  /**
   * @param {Vector3} point 
   * @returns {Vector3} The velocity of a point relative to this body's position
   */
  velocityAtPoint(point) {
    return Vector3.addv3(this.bodyState.velocity, Vector3.cross(this.bodyState.angularVelocity, Vector3.subtract(point, this.bodyState.position)));
  }
}