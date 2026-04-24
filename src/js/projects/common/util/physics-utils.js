import { ColliderComponent, COMP_COLLIDER } from "../components/class/collider.js";
import { COMP_RIGIDBODY, RigidbodyComponent } from "../components/rigidbody.js";
import { ComponentManager } from "../game/component-manager.js";
import { Matrix3x3 } from "../math/matrix3x3.js";
import { Vector3 } from "../math/vector3.js";

/**
 * Sets the mass of rb.  
 * This will cause rb to recalculate its inertia.
 * @param {RigidbodyComponent} rb
 * @param {number} m 
 */
export function setMass(rb, m) {
  rb.bodyState.mass = m;
  computeInertia(rb);
}

/**
 * Recomputes the inertia of rb.
 * @param {RigidbodyComponent} rb
 */
export function computeInertia(rb) {
  /** @type {ColliderComponent} */
  const colliderComponent = ComponentManager.getComponent(rb.entity, COMP_COLLIDER);
  if (colliderComponent) {
    // TODO Compute inertia based on collider
    rb.iBody = Matrix3x3.multiplyScalar(Matrix3x3.identity(), 0.4 * rb.bodyState.mass);
  } else {
    rb.iBody = Matrix3x3.multiplyScalar(Matrix3x3.identity(), 0.4 * rb.bodyState.mass);
  }
  rb.bodyState.iBodyInv = Matrix3x3.copy(rb.iBody);
  rb.bodyState.iBodyInv.invert();
}

/**
 * Applies an instantaneous linear force to rb at its center of mass.
 * @param {RigidbodyComponent} rb 
 * @param {Vector3} force 
 */
export function addLinearForce(rb, force) {
  rb.bodyState.force.addv3(force);
}

/**
 * Applies an instantaneous torque to rb at its center of mass.
 * @param {RigidbodyComponent} rb 
 * @param {Vector3} force 
 */
export function addTorque(rb, force) {
  rb.bodyState.torque.addv3(force);
}

/**
 * Applies an instantaneous force to rb at the specified point, in local space.
 * The center of mass is assumed to be at the origin (0, 0, 0).
 * @param {RigidbodyComponent} rb 
 * @param {Vector3} force 
 * @param {Vector3} point 
 */
export function addForceAtPosition(rb, force, point) {
  addLinearForce(rb, force);
  addTorque(rb, Vector3.cross(point, force));
}

/**
 * Calculates the velocity of a point relative to the center of mass of rb.
 * = ω(t) × (r_i(t) − x(t)) + v(t)
 * @param {RigidbodyComponent} rb 
 * @param {Vector3} point 
 * @returns {Vector3} 
 */
export function velocityAtPoint(rb, point) {
  return Vector3.addv3(
    Vector3.cross(
      rb.bodyState.angularVelocity, 
      Vector3.subtract(
        point, 
        rb.bodyState.position
      )
    ),
    rb.bodyState.velocity
  );
}