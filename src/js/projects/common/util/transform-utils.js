import { TransformComponent } from "../components/transform.js";
import { Vector3 } from "../math/vector3.js";

/**
 * Calculates the world position of v local to the given transform.
 * @param {import("../math/vector3.js").Vector3Like} v 
 * @param {TransformComponent} transform 
 */
export function getWorldPosition(v, transform) {
  const res = new Vector3().copy(v).addv3(transform.position);
  let next = transform;
  while (transform.parent) {
    next = transform.parent;
    res.addv3(next.position);
  }
  return res;
}

/**
 * Calculates the position local to the given transform.
 * @param {import("../math/vector3.js").Vector3Like} v 
 * @param {TransformComponent} transform 
 * @returns {Vector3}
 */
export function getLocalPosition(v, transform) {
  
}

/**
 * Gets the world forward direction of the given transform.
 * @param {TransformComponent} transform 
 * @returns {Vector3}
 */
export function getWorldForward(transform) {
  return Vector3.forward.rotate(transform.orientation);
}