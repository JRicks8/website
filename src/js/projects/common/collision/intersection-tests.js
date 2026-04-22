import { SphereColliderComponent } from "../components/collider/sphere-collider.js";
import { Vector3 } from "../math/vector3.js";

/**
 * @param {SphereColliderComponent} s1 
 * @param {SphereColliderComponent} s2 
 * @returns {Vector3 | null} The point at which the two spheres are touching, or null if they are not touching.
 */
export function sphereIntersectsSphere(s1, s2) {
  const radii = s1.geometry.parameters.radius + s2.geometry.parameters.radius;
  const dist = s1.entity.transform.position.distanceToSquared(s2.entity.transform.position);
  if (radii * radii >= dist) {
    const dirTo2 = Vector3.subtract(s2.entity.transform.position, s1.entity.transform.position).normalized;
    const intersectionDistance = (Math.sqrt(dist) - radii) / 2;
    const localPoint = Vector3.addv3(
      Vector3.multiply(dirTo2, s1.geometry.parameters.radius),
      Vector3.multiply(dirTo2, intersectionDistance)
    );
    return Vector3.addv3(localPoint, s1.entity.transform.position);
  }
  return null;
}

export function triangleIntersectsTriangle() {

}