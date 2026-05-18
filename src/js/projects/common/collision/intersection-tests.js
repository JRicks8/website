import { Vector3 } from "../math/vector3.js";
import { getBoxBoxPoint, testBoxBoxIntersection } from "./intersection-helpers.js";
import { PhysicsProcess } from "../processes/physics-process.js";
import { ColliderComponent } from "../components/collider/collider.js";
import { ComponentManager } from "../game/component-manager.js";
import { COMP_RIGIDBODY, RigidbodyComponent } from "../components/rigidbody.js";
import { copyBodyState } from "../util/physics-utils.js";
import { GameState } from "../game/game-state.js";

/**
 * Find time of intersection t where t is in (0, dt]
 * @param {ColliderComponent} c1 
 * @param {ColliderComponent} c2 
 * @param {number} dt 
 * @param {(c0, c1) => Vector3 | null} test This test should return true of if the two colliders are separated
 * @returns {number}
 */
export function findTimeOfIntersection(c1, c2, dt, test) {
  if (dt === 0) return 0;
  let interval = dt / 2;
  let t = interval;
  /** @type {RigidbodyComponent} */
  const b1 = ComponentManager.getComponent(c1.entity, COMP_RIGIDBODY);
  const b2 = ComponentManager.getComponent(c2.entity, COMP_RIGIDBODY);

  if (!b1 && !b2) return dt;
  
  const i1 = PhysicsProcess.stepCycleInfo.cacheMap.get(b1);
  const i2 = PhysicsProcess.stepCycleInfo.cacheMap.get(b2);
  for (let i = 0; i < PhysicsProcess.collisionDetectionPrecision; i++) {
    if (i1 !== undefined) {
      b1.bodyState = copyBodyState(PhysicsProcess.stepCycleInfo.cache[i1]);
      PhysicsProcess.updateBody(b1);
      console.log(test(c1, c2));
      PhysicsProcess.stepBody(t, b1);
      PhysicsProcess.updateBody(b1);
    }
    if (i2 !== undefined) {
      b2.bodyState = copyBodyState(PhysicsProcess.stepCycleInfo.cache[i2]);
      PhysicsProcess.updateBody(b2);
      PhysicsProcess.stepBody(t, b2);
      PhysicsProcess.updateBody(b2);
    }

    interval /= 2;
    t += test(c1, c2) ? interval : -interval;
    console.log(t);
  }

  // TODO: make this not suck
  if (i1 !== undefined)
    b1.bodyState = copyBodyState(PhysicsProcess.stepCycleInfo.cache[i1]);
  if (i2 !== undefined)
    b2.bodyState = copyBodyState(PhysicsProcess.stepCycleInfo.cache[i2]);

  return t;
}

/**
 * @param {ColliderComponent} c1 
 * @param {ColliderComponent} c2 
 * @returns {Vector3 | null} The point at which the two spheres are touching, or null if they are not touching.
 */
export function sphToSph(c1, c2) {
  if (!c1.entity || !c2.entity) return null;

  const radii = c1.geometry.parameters.radius + c2.geometry.parameters.radius;
  const dist = c1.entity.transform.position.distanceToSquared(c2.entity.transform.position);
  if (radii * radii >= dist) {
    const dirTo2 = Vector3.subtract(c2.entity.transform.position, c1.entity.transform.position).normalized;
    return Vector3.add(
      Vector3.multiply(dirTo2, c1.geometry.parameters.radius),
      Vector3.multiply(dirTo2, (Math.sqrt(dist) - radii) / 2),
      c1.entity.transform.position
    );
  }
  return null;
}

/**
 * @param {ColliderComponent} c1
 * @param {ColliderComponent} c2
 * @returns {Vector3 | null} The point at which the two boxes are touching, or null if they are not touching.
 */
export function boxToBox(c1, c2) {
  // Use SAT to determine if the boxes are colliding
  const axis = testBoxBoxIntersection(c1, c2);
  if (!axis) {
    const t = findTimeOfIntersection(c1, c2, PhysicsProcess.stepCycleInfo.dt, testBoxBoxIntersection);
    GameState.paused = true;
    console.log(PhysicsProcess.stepCycleInfo.dt, t);
    getBoxBoxPoint(c1, c2);
  }

  return null;
}

/**
 * @param {ColliderComponent} b1
 * @param {ColliderComponent} b2
 * @returns {Vector3 | null} The point at which the two bodies are touching, or null if they are not touching.
 */
export function vexToVex(b1, b2) {
  return null;
}

/**
 * @param {ColliderComponent} b1
 * @param {ColliderComponent} b2
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