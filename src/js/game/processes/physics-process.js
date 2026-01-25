import { Matrix3x3 } from "../../math/matrix3x3.js";
import { Quaternion } from "../../math/quaternion.js";
import { Vector3 } from "../../math/vector3.js";
import { BodyState } from "../../physics/body-state.js";
import { BroadPhaseSolver } from "../../physics/broad-phase.js";
import { NarrowPhaseSolver } from "../../physics/narrow-phase.js";
import { RigidbodyComponent } from "../components/rigidbody.js";

/** @type {BodyState[]} */
let cache = [];

const broadPhaseSolver = new BroadPhaseSolver();
const narrowPhaseSolver = new NarrowPhaseSolver();

/**
 * @param {RigidbodyComponent[]} bodies 
 */
function createCache(bodies) {
  cache = bodies.map(b => { 
    return /** @type {BodyState} */ {...b.bodyState };
  });
}

/**
 * @param {number} dt
 * @param {RigidbodyComponent} body
 * @param {number} index // Index of the body in the 'bodies' array
 */
function stepBody(dt, body, index) {
  const bodyState = body.bodyState;

  if (!body.noForces) {
    // Apply primitive forces
    bodyState.momentum.addv3(bodyState.force);
    bodyState.angularMomentum.addv3(bodyState.torque);
    
    // Calculate velocities
    bodyState.velocity = Vector3.divide(bodyState.momentum, bodyState.mass);

    bodyState.rMatrix = Quaternion.toMatrix(bodyState.orientation);

    const rT = Matrix3x3.copy(bodyState.rMatrix);
    rT.transpose();
    bodyState.iInv = Matrix3x3.multiplyMatrix(Matrix3x3.multiplyMatrix(bodyState.rMatrix, rT), bodyState.iBodyInv);

    bodyState.angularVelocity = Matrix3x3.multiplyVector3(bodyState.iInv, bodyState.angularMomentum);
  } else {
    // With no forces being applied, the momentum is dictated by the velocity instead
    bodyState.momentum = Vector3.multiply(bodyState.velocity, bodyState.mass);
    // TODO ;o; angular velocity...
    // bodyState.angularMomentum = ;
  }

  // Apply velocities to spatial state
  bodyState.position.addv3(Vector3.multiply(bodyState.velocity, dt));

  const deltaOrientation = Quaternion.multiplyQuaternion(new Quaternion(0, ...bodyState.angularVelocity), bodyState.orientation);
  deltaOrientation.multiplyScalar(0.5 * dt);
  bodyState.orientation.add(deltaOrientation);
  bodyState.orientation.normalize();

  // Zero-out the forces
  bodyState.force = new Vector3();
  bodyState.torque = new Vector3();
}

export default {
  /**
   * Advances the physics simulation by dt seconds
   * @param {number} dt 
   * @param {RigidbodyComponent[]} bodies
   */
  step(dt, bodies) {
    createCache(bodies);

    bodies.forEach((body, i) => {
      stepBody(dt, body, i);
    });
    
    const maybeColliding = broadPhaseSolver.solve(bodies);
    if (maybeColliding.length > 0) {
      console.log(maybeColliding);
    }
    const contacts = narrowPhaseSolver.solve(maybeColliding);
  }
}