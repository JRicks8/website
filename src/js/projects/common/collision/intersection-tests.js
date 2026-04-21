import { SphereColliderComponent } from "../components/collider/sphere-collider.js";

/**
 * @param {SphereColliderComponent} s1 
 * @param {SphereColliderComponent} s2 
 * @returns {boolean} True if the two spheres are not touching
 */
export function sphereSeparatesSphere(s1, s2) {
  return (s1.geometry.parameters.radius + s2.geometry.parameters.radius) * (s1.geometry.parameters.radius + s2.geometry.parameters.radius) < 
    s1.entity.transform.position.distanceToSquared(s2.entity.transform.position);
}

export function triangleIntersectsTriangle() {

}