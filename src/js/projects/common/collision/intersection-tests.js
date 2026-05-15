import { Vector3 } from "../math/vector3.js";
import { getBoxBoxPoint, testBoxBoxIntersection } from "./intersection-helpers.js";
import { RigidbodyComponent } from "../components/rigidbody.js";
import { PhysicsProcess } from "../processes/physics-process.js";

/**
 * Find time of intersection t where t is in [0, dt)
 * @param {RigidbodyComponent} b1 
 * @param {RigidbodyComponent} b2 
 * @param {number} dt 
 * @param {(c0, c1) => Vector3 | null} test
 * @returns {number}
 */
export function findTimeOfIntersection(b1, b2, dt, test) {
  if (dt === 0) return 0;
  let t = dt / 2;
  for (let i = 0; i < PhysicsProcess.collisionDetectionPrecision; i++) {
    const i1 = PhysicsProcess.stepCycleInfo.cacheMap.get(b1);
    const i2 = PhysicsProcess.stepCycleInfo.cacheMap.get(b2);
    b1.bodyState = {...PhysicsProcess.stepCycleInfo.cache[i1]};
    b2.bodyState = {...PhysicsProcess.stepCycleInfo.cache[i2]};

    PhysicsProcess.stepBody(t, b1);
    PhysicsProcess.stepBody(t, b2);

    t *= test(b1.colliderComponent, b2.colliderComponent) ? 0.5 : 1.5;
  }
  return t;
}

/**
 * @param {RigidbodyComponent} s1 
 * @param {RigidbodyComponent} s2 
 * @returns {Vector3 | null} The point at which the two spheres are touching, or null if they are not touching.
 */
export function sphToSph(s1, s2) {
  if (!s1.entity || !s2.entity) return null;

  const radii = s1.colliderComponent.geometry.parameters.radius + s2.colliderComponent.geometry.parameters.radius;
  const dist = s1.entity.transform.position.distanceToSquared(s2.entity.transform.position);
  if (radii * radii >= dist) {
    const dirTo2 = Vector3.subtract(s2.entity.transform.position, s1.entity.transform.position).normalized;
    return Vector3.add(
      Vector3.multiply(dirTo2, s1.colliderComponent.geometry.parameters.radius),
      Vector3.multiply(dirTo2, (Math.sqrt(dist) - radii) / 2),
      s1.entity.transform.position
    );
  }
  return null;
}

/**
 * @param {RigidbodyComponent} b1
 * @param {RigidbodyComponent} b2
 * @returns {Vector3 | null} The point at which the two boxes are touching, or null if they are not touching.
 */
export function boxToBox(b1, b2) {
  // Use SAT to determine if the boxes are colliding
  const axis = testBoxBoxIntersection(b1.colliderComponent, b2.colliderComponent);
  if (!axis) {
    const t = findTimeOfIntersection(b1, b2, PhysicsProcess.stepCycleInfo.dt, testBoxBoxIntersection);
    console.log(t);
    getBoxBoxPoint(b1, b2);
  }

  return null;
}

/**
 * @param {RigidbodyComponent} b1
 * @param {RigidbodyComponent} b2
 * @returns {Vector3 | null} The point at which the two bodies are touching, or null if they are not touching.
 */
export function vexToVex(b1, b2) {
  return null;
}

/**
 * @param {RigidbodyComponent} b1
 * @param {RigidbodyComponent} b2
 * @returns {Vector3 | null} The point at which the two bodies are touching, or null if they are not touching.
 */
export function cavToCav(b1, b2) {
  return null;
}

/**
 * @param {RigidbodyComponent} b1
 * @param {RigidbodyComponent} b2
 * @returns {Vector3 | null} The point at which the two bodies are touching, or null if they are not touching.
 */
export function sphToBox(b1, b2) {
  return null;
}

/**
 * @param {RigidbodyComponent} b1
 * @param {RigidbodyComponent} b2
 * @returns {Vector3 | null} The point at which the two bodies are touching, or null if they are not touching.
 */
export function sphToVex(b1, b2) {
  return null;
}

/**
 * @param {RigidbodyComponent} b1
 * @param {RigidbodyComponent} b2
 * @returns {Vector3 | null} The point at which the two bodies are touching, or null if they are not touching.
 */
export function sphToCav(b1, b2) {
  return null;
}

/**
 * @param {RigidbodyComponent} b1
 * @param {RigidbodyComponent} b2
 * @returns {Vector3 | null} The point at which the two bodies are touching, or null if they are not touching.
 */
export function boxToVex(b1, b2) {
  return null;
}

/**
 * @param {RigidbodyComponent} b1
 * @param {RigidbodyComponent} b2
 * @returns {Vector3 | null} The point at which the two bodies are touching, or null if they are not touching.
 */
export function boxToCav(b1, b2) {
  return null;
}

/**
 * @param {RigidbodyComponent} b1
 * @param {RigidbodyComponent} b2
 * @returns {Vector3 | null} The point at which the two bodies are touching, or null if they are not touching.
 */
export function vexToCav(b1, b2) {
  return null;
}