import { Color } from "three";
import { TransformComponent } from "../components/transform.js";
import { Matrix3x3 } from "../math/matrix3x3.js";
import { Quaternion } from "../math/quaternion.js";
import { Vector3 } from "../math/vector3.js";
import { DebugProcess } from "../processes/debug-process.js";

/** @import {Vector3Like} from "../math/vector3.js" */

/**
 * Calculates the world position of v local to the given transform.
 * The world position is calculated irrespective of orientation (TODO)
 * @param {TransformComponent} transform 
 * @param {Vector3} [v] 
 */
export function getWorldPosition(transform, v = new Vector3()) {
  const res = v.getCopy().addv3(transform.position);
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
  throw Error('Not Implemented');
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