import { RigidbodyComponent } from "../components/rigidbody.js";
import { COMP_TRANSFORM, TransformComponent } from "../components/transform.js";
import { Matrix3x3 } from "../math/matrix3x3.js";
import { Quaternion } from "../math/quaternion.js";
import { Vector3 } from "../math/vector3.js";
import { BodyState } from "../physics/body-state.js";
import { BroadPhaseSolver } from "../physics/broad-phase.js";

import { Quaternion as ThreeQuaternion } from "three";
import { ComponentManager } from "../game/component-manager.js";
import { NarrowPhaseSolver } from "../collision/narrow-phase.js";

// Excellent resource: https://graphics.pixar.com/pbm2001/pdf/notesg.pdf

/** @type {BodyState[]} */
let _cache = [];
/** @type {RigidbodyComponent[]} */
const _bodies = [];

const _broadPhaseSolver = new BroadPhaseSolver();
const _narrowPhaseSolver = new NarrowPhaseSolver();

/**
 * @param {number} dt
 * @param {RigidbodyComponent} body
 * @param {number} index // Index of the body in the 'bodies' array
 */
function stepBody(dt, body, index) {
  const bodyState = body.bodyState;

  if (!body.noForces) {
    // Apply primitive forces
    bodyState.momentum.addv3(body.bodyState.force);
    bodyState.angularMomentum.addv3(bodyState.torque);
    
    // Calculate velocities
    bodyState.velocity = Vector3.divide(
      Vector3.multiply(bodyState.momentum, dt), 
      bodyState.mass
    );

    bodyState.rMatrix = Quaternion.toMatrix(bodyState.orientation);

    const rT = Matrix3x3.copy(bodyState.rMatrix).transpose();
    bodyState.iInv = Matrix3x3.multiplyMatrix(
      Matrix3x3.multiplyMatrix(bodyState.rMatrix, rT), 
      bodyState.iBodyInv
    );

    bodyState.angularVelocity = Matrix3x3.multiplyVector3(bodyState.iInv, bodyState.angularMomentum);
  } else {
    // With no forces applied, the momentum is dictated by the velocity instead
    bodyState.momentum = Vector3.multiply(bodyState.velocity, bodyState.mass);
    // TODO ;o; angular velocity...
    // bodyState.angularMomentum = ;
  }

  // Apply velocities to spatial state
  bodyState.position.addv3(
    Vector3.multiply(bodyState.velocity, dt));

  const deltaOrientation = Quaternion.multiplyQuaternion(new Quaternion(0, ...bodyState.angularVelocity), bodyState.orientation);
  deltaOrientation.multiplyScalar(0.5 * dt);
  bodyState.orientation.add(deltaOrientation);
  bodyState.orientation.normalize();

  // Zero-out the forces
  bodyState.force = new Vector3();
  bodyState.torque = new Vector3();
}

export const PhysicsProcess = {
  registryContext: 'rigidbodies',
  globalConstantForce: new Vector3(),

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
    _cache = [];
    _bodies.forEach(body => {
      /** @type {TransformComponent} */
      if (body.entity) body.bodyState.position.copy(body.entity.transform.position);

      // Apply global forces
      body.bodyState.force.addv3(this.globalConstantForce);

      _cache.push({...body.bodyState});
    });

    _bodies.forEach((body, i) => {
      stepBody(dt, body, i);
    });

    const maybeColliding = _broadPhaseSolver.solve(_bodies);
    if (maybeColliding.length > 0) {
      // console.log(maybeColliding);
    }
    const contacts = _narrowPhaseSolver.solve(maybeColliding);
    // TODO resolve contacts
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