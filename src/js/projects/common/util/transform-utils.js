import { TransformComponent } from "../components/transform.js";
import { Vector3 } from "../math/vector3.js";

/**
 * Retrieves the world position from the given transform.
 * @param {TransformComponent} transform 
 */
export function getWorldPosition(transform) {
  const res = new Vector3().copy(transform.position);
  let next = transform;
  while (transform.parent) {
    next = transform.parent;
    res.addv3(next.position);
  }
  return res;
}