import { Component } from "../game/component.js";
import { Matrix3x3 } from "../math/matrix3x3.js";
import { Quaternion } from "../math/quaternion.js";
import { Quaternion as ThreeQuaternion } from "three";
import { Vector3 } from "../math/vector3.js";
import { Collider } from "./collider.js";
import { BodyState } from "./body-state.js";

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

  /** @param {number} dt */
  update(dt) {
    this.gameObject.position.set(this.bodyState.position.x, this.bodyState.position.y, this.bodyState.position.z);
    this.gameObject.orientation.set(this.bodyState.orientation.w, this.bodyState.orientation.x, this.bodyState.orientation.y, this.bodyState.orientation.z);
    
    this._collider.mesh.position.set(this.bodyState.position.x, this.bodyState.position.y, this.bodyState.position.z);
    this._collider.mesh.setRotationFromQuaternion(new ThreeQuaternion(this.bodyState.orientation.x, this.bodyState.orientation.y, this.bodyState.orientation.z, this.bodyState.orientation.w));
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

  /**
   * Simulates this rigidbody for time t
   * @param {number} dt 
   */
  step(dt) {
    this.cachedState = { ...this.bodyState };

    if (!this.noForces) {
      // Apply primitive forces
      this.bodyState.momentum.addv3(this.bodyState.force);
      this.bodyState.angularMomentum.addv3(this.bodyState.torque);
      
      // Calculate velocities
      this.bodyState.velocity = Vector3.divide(this.bodyState.momentum, this.bodyState.mass);

      this.bodyState.rMatrix = Quaternion.toMatrix(this.bodyState.orientation);

      const rT = Matrix3x3.copy(this.bodyState.rMatrix);
      rT.transpose();
      this.bodyState.iInv = Matrix3x3.multiplyMatrix(Matrix3x3.multiplyMatrix(this.bodyState.rMatrix, rT), this.bodyState.iBodyInv);

      this.bodyState.angularVelocity = Matrix3x3.multiplyVector3(this.bodyState.iInv, this.bodyState.angularMomentum);
    } else {
      // With no forces being applied, the momentum is dictated by the velocity instead
      this.bodyState.momentum = Vector3.multiply(this.bodyState.velocity, this.bodyState.mass);
      // TODO ;o;
      // this.bodyState.angularMomentum = ;
    }

    // Apply velocities to spatial state
    this.bodyState.position.addv3(Vector3.multiply(this.bodyState.velocity, dt));

    const deltaOrientation = Quaternion.multiplyQuaternion(new Quaternion(0, ...this.bodyState.angularVelocity), this.bodyState.orientation);
    deltaOrientation.multiplyScalar(0.5 * dt);
    this.bodyState.orientation.add(deltaOrientation);
    this.bodyState.orientation.normalize();

    // Zero-out the forces
    this.bodyState.force = new Vector3();
    this.bodyState.torque = new Vector3();
  }

  /** @param {number} dt */
  stepFromLastState(dt) {
    this.bodyState = { ...this.cachedState };
    
    this.step(dt);
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