import { Vector3 } from "../math/vector3.js";
import { ConvexColliderComponent } from "../components/collider/convex-polyhedron-collider.js";
import { ConcaveColliderComponent } from "../components/collider/concave-collider.js";
import { ColliderComponent } from "../components/collider/collider.js";
import { BoxColliderComponent } from "../components/collider/box-collider.js";
import { SphereColliderComponent } from "../components/collider/sphere-collider.js";

/**
 * @param {SphereColliderComponent} s1 
 * @param {SphereColliderComponent} s2 
 * @returns {Vector3 | null} The point at which the two spheres are touching, or null if they are not touching.
 */
export function sphToSph(s1, s2) {
  if (!s1.entity || !s2.entity) return null;

  const radii = s1.geometry.parameters.radius + s2.geometry.parameters.radius;
  const dist = s1.entity.transform.position.distanceToSquared(s2.entity.transform.position);
  if (radii * radii >= dist) {
    const dirTo2 = Vector3.subtract(s2.entity.transform.position, s1.entity.transform.position).normalized;
    return Vector3.addv3(
      Vector3.multiply(dirTo2, s1.geometry.parameters.radius),
      Vector3.multiply(dirTo2, (Math.sqrt(dist) - radii) / 2),
      s1.entity.transform.position
    );
  }
  return null;
}

/**
 * @param {BoxColliderComponent} b1
 * @param {BoxColliderComponent} b2
 * @returns {Vector3 | null} The point at which the two boxes are touching, or null if they are not touching.
 */
export function boxToBox(b1, b2) {
  // Use SAT to determine if the boxes are colliding
  

  return null;
}

/**
 * @param {ConvexColliderComponent} b1
 * @param {ConvexColliderComponent} b2
 * @returns {Vector3 | null} The point at which the two bodies are touching, or null if they are not touching.
 */
export function vexToVex(b1, b2) {
  return null;
}

/**
 * @param {ConcaveColliderComponent} b1
 * @param {ConcaveColliderComponent} b2
 * @returns {Vector3 | null} The point at which the two bodies are touching, or null if they are not touching.
 */
export function cavToCav(b1, b2) {
  return null;
}

/**
 * @param {ColliderComponent} b1
 * @param {ColliderComponent} b2
 * @returns {Vector3 | null} The point at which the two bodies are touching, or null if they are not touching.
 */
export function sphToBox(b1, b2) {
  return null;
}

/**
 * @param {ColliderComponent} b1
 * @param {ColliderComponent} b2
 * @returns {Vector3 | null} The point at which the two bodies are touching, or null if they are not touching.
 */
export function sphToVex(b1, b2) {
  return null;
}

/**
 * @param {ColliderComponent} b1
 * @param {ColliderComponent} b2
 * @returns {Vector3 | null} The point at which the two bodies are touching, or null if they are not touching.
 */
export function sphToCav(b1, b2) {
  return null;
}

/**
 * @param {ColliderComponent} b1
 * @param {ColliderComponent} b2
 * @returns {Vector3 | null} The point at which the two bodies are touching, or null if they are not touching.
 */
export function boxToVex(b1, b2) {
  return null;
}

/**
 * @param {ColliderComponent} b1
 * @param {ColliderComponent} b2
 * @returns {Vector3 | null} The point at which the two bodies are touching, or null if they are not touching.
 */
export function boxToCav(b1, b2) {
  return null;
}

/**
 * @param {ColliderComponent} b1
 * @param {ColliderComponent} b2
 * @returns {Vector3 | null} The point at which the two bodies are touching, or null if they are not touching.
 */
export function vexToCav(b1, b2) {
  return null;
}