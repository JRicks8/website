import { TransformComponent } from "../components/transform.js";
import { Vector3 } from "../math/vector3.js";

/** @import {Vector3Like} from "../math/vector3.js" */

/**
 * Calculates the world position of v local to the given transform.
 * The world position is calculated irrespective of orientation (TODO)
 * @param {TransformComponent} transform 
 * @param {Vector3Like} [v] 
 */
export function getWorldPosition(transform, v = new Vector3) {
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
 * @param {Vector3Like} v 
 * @param {TransformComponent} transform 
 * @returns {Vector3}
 */
export function getLocalPosition(v, transform) {
  // TODO
}

/**
 * Gets the world forward direction of the given transform.
 * @param {TransformComponent} transform 
 * @returns {Vector3}
 */
export function getWorldForward(transform) {
  return Vector3.forward().rotate(transform.orientation);
}