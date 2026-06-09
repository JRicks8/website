import { Restraint, RESTRAINT_POSITION, RESTRAINT_POSITION_AXIS, RESTRAINT_ROTATION_AXIS, RigidbodyComponent } from "../components/rigidbody.js";
import { COMP_TRANSFORM, TransformComponent } from "../components/transform.js";
import { Matrix3x3 } from "../math/matrix3x3.js";
import { Quaternion } from "../math/quaternion.js";
import { Vector3 } from "../math/vector3.js";
import { BodyState } from "../physics/body-state.js";
import { BroadPhaseSolver } from "../physics/broad-phase.js";

import { BufferGeometry, Quaternion as ThreeQuaternion } from "three";
import { ComponentManager } from "../game/component-manager.js";
import { NarrowPhaseSolver } from "../collision/narrow-phase/narrow-phase.js";
import { applyLinearAxisRestraint, applyLinearRestraint, applyRotationAxisRestraint, copyBodyState } from "../util/physics-utils.js";

/** @import {BodyConfig} from "../components/rigidbody.js" */

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
 * @typedef {Object} BodyInfo
 * @property {BodyState} state
 * @property {BodyConfig} config
 * @property {BufferGeometry} geometry
 * @property {string} colliderType
 */

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
    /** @type {Map<BodyInfo, number>} */
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

    const bodiesInfo = _bodies.map((b) => {
      if (b.entity) b.state.position.copy(b.entity.transform.position);
      b.state.force.addv3(this.globalConstantForce);

      /** @type {BodyInfo} */
      const info = {
        state: copyBodyState(b.state),
        config: b.bodyConfig,
        geometry: b.colliderComponent.geometry,
        colliderType: b.colliderComponent.colliderType
      };
      this.stepCycleInfo.cacheMap.set(info, this.stepCycleInfo.cache.length);
      this.stepCycleInfo.cache.push(copyBodyState(b.state));

      return info;
    });

    bodiesInfo.forEach((body) => {
      this.stepBody(dt, body);
    });

    const maybeColliding = _broadPhaseSolver.solve(bodiesInfo);
    _narrowPhaseSolver.solve(maybeColliding);

    for (let i = 0; i < bodiesInfo.length; i++)
      _bodies[i].state = bodiesInfo[i].state;
  },

  /**
   * @param {number} dt
   * @param {BodyInfo} body
   */
  stepBody(dt, body) {
    if (!body.config.noForces) {
      // Apply primitive forces
      const adjustedForce = Vector3.multiply(body.state.force, dt);
      body.state.momentum.addv3(adjustedForce);

      const adjustedTorque = Vector3.multiply(body.state.torque, dt);
      body.state.angularMomentum.addv3(adjustedTorque);
      
      // Calculate velocities
      body.state.velocity = Vector3.divide(
        body.state.momentum, 
        body.state.mass
      );

      body.state.rMatrix = Quaternion.toMatrix(body.state.orientation);

      const rT = Matrix3x3.getCopy(body.state.rMatrix).transpose();
      body.state.iInv = Matrix3x3.multiplyMatrix(
        Matrix3x3.multiplyMatrix(body.state.rMatrix, body.state.iBodyInv), 
        rT
      );

      body.state.angularVelocity = Matrix3x3.multiplyVector3(body.state.iInv, body.state.angularMomentum);
    } else {
      // With no forces applied, the momentum is dictated by the velocity instead
      body.state.momentum = Vector3.multiply(body.state.velocity, body.state.mass);
      // TODO ;o; angular velocity...
      // body.state.angularMomentum = ;
    }

    // Apply velocities to spatial state
    let deltaPosition = Vector3.multiply(body.state.velocity, dt);

    let deltaOrientation = Quaternion.multiplyQuaternion(new Quaternion(0, ...body.state.angularVelocity), body.state.orientation)
      .multiplyScalar(0.5 * dt);

    // Apply restraints
    applyRestraints(body.config.restraints ?? [], deltaPosition, deltaOrientation);

    body.state.position.addv3(deltaPosition);
    body.state.orientation.add(deltaOrientation).normalize();

    // Zero-out the forces
    body.state.force = new Vector3();
    body.state.torque = new Vector3();
  },

  /** Updates the transform components on each of the bodies to match its rigidbody position. */
  update() {
    for (const body of _bodies) {
      this.updateBody(body);
    }
  },

  /**
   * Updates the transform components on the given body to match its rigidbody position.
   * @param {RigidbodyComponent} b
   */
  updateBody(b) {
    if (!b.entity) return;
    
    /** @type {TransformComponent} */
    const t = ComponentManager.getComponent(b.entity, COMP_TRANSFORM);
    if (!t) return;

    t.position.set(b.state.position.x, b.state.position.y, b.state.position.z);
    t.orientation.set(b.state.orientation.w, b.state.orientation.x, b.state.orientation.y, b.state.orientation.z);
    
    b.colliderComponent.colliderMesh.position.set(b.state.position.x, b.state.position.y, b.state.position.z);
    b.colliderComponent.colliderMesh.setRotationFromQuaternion(new ThreeQuaternion(b.state.orientation.x, b.state.orientation.y, b.state.orientation.z, b.state.orientation.w));
  }
}