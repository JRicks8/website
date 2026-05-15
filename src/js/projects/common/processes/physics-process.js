import { Restraint, RESTRAINT_POSITION, RESTRAINT_POSITION_AXIS, RESTRAINT_ROTATION_AXIS, RigidbodyComponent } from "../components/rigidbody.js";
import { COMP_TRANSFORM, TransformComponent } from "../components/transform.js";
import { Matrix3x3 } from "../math/matrix3x3.js";
import { Quaternion } from "../math/quaternion.js";
import { Vector3 } from "../math/vector3.js";
import { BodyState } from "../physics/body-state.js";
import { BroadPhaseSolver } from "../physics/broad-phase.js";

import { Quaternion as ThreeQuaternion } from "three";
import { ComponentManager } from "../game/component-manager.js";
import { NarrowPhaseSolver } from "../collision/narrow-phase.js";
import { applyLinearAxisRestraint, applyLinearRestraint, applyRotationAxisRestraint } from "../util/physics-utils.js";

// Excellent resource: https://graphics.pixar.com/pbm2001/pdf/notesg.pdf

/** @type {RigidbodyComponent[]} */
const _bodies = [];

const _broadPhaseSolver = new BroadPhaseSolver();
const _narrowPhaseSolver = new NarrowPhaseSolver();

/** @type {{[key: string]: (r: Restraint, v: Vector3, q: Quaternion) => void}} */
const _restraintMapper = {
  [RESTRAINT_POSITION]: (r, v, q) => applyLinearRestraint(r, v),
  [RESTRAINT_POSITION_AXIS]: (r, v, q) => applyLinearAxisRestraint(r, v),
  [RESTRAINT_ROTATION_AXIS]: (r, v, q) => applyRotationAxisRestraint(r, q)
};

/**
 * Applies all active restraints to the proposed change in position and orientation
 * @param {Restraint[]} restraints 
 * @param {Vector3} deltaPosition 
 * @param {Quaternion} deltaOrientation 
 */
function applyRestraints(restraints, deltaPosition, deltaOrientation) {
  for (const restraint of restraints) {
    if (restraint.type) _restraintMapper[restraint.type](restraint, deltaPosition, deltaOrientation);
  }
}

export const PhysicsProcess = {
  registryContext: 'rigidbodies',
  globalConstantForce: new Vector3(),
  /**
   * The number of times to use binary search to estimate the time of collision
   * @type {number}
   */
  collisionDetectionPrecision: 3,

  stepCycleInfo: {
    /** @type {BodyState[]} */
    cache: [],
    /** @type {Map<RigidbodyComponent, number>} */
    cacheMap: new Map(),
    /** @type {number} */
    dt: 0
  },

  /** @param {RigidbodyComponent} body */
  add: (body) => {
    _bodies.push(body);
  },

  /** @param {RigidbodyComponent} body */
  remove: (body) => {
    _bodies.splice(_bodies.findIndex((b) => b === body));
  },

  /**
   * Advances the physics simulation by dt seconds
   * @param {number} dt 
   */
  step(dt) {
    // Setup cache & bodies
    this.stepCycleInfo.cache = [];
    this.stepCycleInfo.cacheMap = new Map();
    this.stepCycleInfo.dt = dt;

    _bodies.forEach(body => {
      /** @type {TransformComponent} */
      if (body.entity) body.bodyState.position.copy(body.entity.transform.position);

      // Apply global forces
      body.bodyState.force.addv3(this.globalConstantForce);

      this.stepCycleInfo.cacheMap.set(body, this.stepCycleInfo.cache.length);
      this.stepCycleInfo.cache.push({...body.bodyState});
    });

    _bodies.forEach((body) => {
      this.stepBody(dt, body);
    });

    const maybeColliding = _broadPhaseSolver.solve(_bodies);
    _narrowPhaseSolver.solve(maybeColliding);
    // TODO resolve contacts
  },

  /**
   * @param {number} dt
   * @param {RigidbodyComponent} body
   */
  stepBody(dt, body) {
    const bodyState = body.bodyState;

    if (!body.noForces) {
      // Apply primitive forces
      const adjustedForce = Vector3.multiply(body.bodyState.force, dt);
      bodyState.momentum.addv3(adjustedForce);

      const adjustedTorque = Vector3.multiply(bodyState.torque, dt);
      bodyState.angularMomentum.addv3(adjustedTorque);
      
      // Calculate velocities
      bodyState.velocity = Vector3.divide(
        bodyState.momentum, 
        bodyState.mass
      );

      bodyState.rMatrix = Quaternion.toMatrix(bodyState.orientation);

      const rT = Matrix3x3.copy(bodyState.rMatrix).transpose();
      bodyState.iInv = Matrix3x3.multiplyMatrix(
        Matrix3x3.multiplyMatrix(bodyState.rMatrix, bodyState.iBodyInv), 
        rT
      );

      bodyState.angularVelocity = Matrix3x3.multiplyVector3(bodyState.iInv, bodyState.angularMomentum);
    } else {
      // With no forces applied, the momentum is dictated by the velocity instead
      bodyState.momentum = Vector3.multiply(bodyState.velocity, bodyState.mass);
      // TODO ;o; angular velocity...
      // bodyState.angularMomentum = ;
    }

    // Apply velocities to spatial state
    let deltaPosition = Vector3.multiply(bodyState.velocity, dt);

    let deltaOrientation = Quaternion.multiplyQuaternion(new Quaternion(0, ...bodyState.angularVelocity), bodyState.orientation)
      .multiplyScalar(0.5 * dt);

    // Apply restraints
    applyRestraints(body.restraints, deltaPosition, deltaOrientation);

    bodyState.position.addv3(deltaPosition);
    bodyState.orientation.add(deltaOrientation).normalize();

    // Zero-out the forces
    bodyState.force = new Vector3();
    bodyState.torque = new Vector3();
  },

  /** Updates the transform components on each of the bodies to match its rigidbody position. */
  update() {
    for (const body of _bodies) {
      if (!body.entity) continue;
      /** @type {TransformComponent} */
      const t = ComponentManager.getComponent(body.entity, COMP_TRANSFORM);
      if (!t) continue;

      t.position.set(body.bodyState.position.x, body.bodyState.position.y, body.bodyState.position.z);
      t.orientation.set(body.bodyState.orientation.w, body.bodyState.orientation.x, body.bodyState.orientation.y, body.bodyState.orientation.z);
      
      body.colliderComponent?.colliderMesh?.position.set(body.bodyState.position.x, body.bodyState.position.y, body.bodyState.position.z);
      body.colliderComponent?.colliderMesh?.setRotationFromQuaternion(new ThreeQuaternion(body.bodyState.orientation.x, body.bodyState.orientation.y, body.bodyState.orientation.z, body.bodyState.orientation.w));
    }
  }
}