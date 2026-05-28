import { Vector3 } from "../math/vector3.js";
import { PhysicsProcess } from "../processes/physics-process.js";
import { copyBodyState } from "../util/physics-utils.js";
import { SphereGeometry } from "three";
import { getBoxBoxPoint, testBoxBoxIntersection } from "./point/boxBox.js";

/** @import {BodyInfo} from "../processes/physics-process.js" */
/** @import {IntersectionTester} from "./intersection-test-mapper.js" */

/**
 * Find approximate time of intersection t where t is in (0, dt].
 * Accuracy is configurable.
 * @param {BodyInfo} b1
 * @param {BodyInfo} b2
 * @param {number} dt
 * @param {IntersectionTester} test This test should return true of if the two colliders are separated
 * @returns {{ time: number, results: any[] }} The approximate time of collision between the two bodies, and the output results
 * of the test function for each iteration.
 */
export function findTimeOfIntersection(b1, b2, dt, test) {
  if (dt === 0) return { time: 0, results: []};
  let interval = dt / 2;
  let t = interval;

  if (!b1 && !b2) return { time: dt, results: [] };

  let results = [];
  
  const i1 = PhysicsProcess.stepCycleInfo.cacheMap.get(b1);
  const i2 = PhysicsProcess.stepCycleInfo.cacheMap.get(b2);
  const initState1 = PhysicsProcess.stepCycleInfo.cache[i1];
  const initState2 = PhysicsProcess.stepCycleInfo.cache[i2];
  for (let i = 0; i < PhysicsProcess.collisionDetectionPrecision; i++) {
    if (i1 !== undefined) {
      b1.state = copyBodyState(initState1);
      PhysicsProcess.stepBody(t, b1);
    }
    if (i2 !== undefined) {
      b2.state = copyBodyState(initState2);
      PhysicsProcess.stepBody(t, b2);
    }

    interval /= 2;
    const res = test(b1, b2);
    results.push(res);
    t += res ? interval : -interval;
  }

  if (i1 !== undefined)
    b1.state = copyBodyState(initState1);
  if (i2 !== undefined)
    b2.state = copyBodyState(initState2);

  return {
    time: t,
    results: results
  };
}

/**
 * @param {BodyInfo} b1
 * @param {BodyInfo} b2
 * @returns {Vector3 | null} The point at which the two spheres are touching, or null if they are not touching.
 */
export function sphToSph(b1, b2) {
  const b1Geo = /** @type {SphereGeometry} */ (b1.geometry);
  const b2Geo = /** @type {SphereGeometry} */ (b2.geometry);

  const radii = b1Geo.parameters.radius + b2Geo.parameters.radius;
  const dist = b1.state.position.distanceToSquared(b2.state.position);
  if (radii * radii >= dist) {
    const dirTo2 = Vector3.subtract(b2.state.position, b1.state.position).normalized;
    return Vector3.add(
      Vector3.multiply(dirTo2, b1Geo.parameters.radius),
      Vector3.multiply(dirTo2, (Math.sqrt(dist) - radii) / 2),
      b1.state.position
    );
  }
  return null;
}

/**
 * @param {BodyInfo} b1
 * @param {BodyInfo} b2
 * @returns {Vector3 | null} The point at which the two boxes are touching, or null if they are not touching.
 */
export function boxToBox(b1, b2) {
  // Use SAT to determine if the boxes are colliding
  const axis = testBoxBoxIntersection(b1, b2);
  if (!axis) {
    const out = findTimeOfIntersection(b1, b2, PhysicsProcess.stepCycleInfo.dt, testBoxBoxIntersection);

    return getBoxBoxPoint(b1, b2, lastAxis);
  }

  return null;
}

/**
 * @param {BodyInfo} b1
 * @param {BodyInfo} b2
 * @returns {Vector3 | null} The point at which the two bodies are touching, or null if they are not touching.
 */
export function vexToVex(b1, b2) {
  return null;
}

/**
 * @param {BodyInfo} b1
 * @param {BodyInfo} b2
 * @returns {Vector3 | null} The point at which the two bodies are touching, or null if they are not touching.
 */
export function cavToCav(b1, b2) {
  return null;
}

/**
 * @param {BodyInfo} b1
 * @param {BodyInfo} b2
 * @returns {Vector3 | null} The point at which the two bodies are touching, or null if they are not touching.
 */
export function sphToBox(b1, b2) {
  return null;
}

/**
 * @param {BodyInfo} b1
 * @param {BodyInfo} b2
 * @returns {Vector3 | null} The point at which the two bodies are touching, or null if they are not touching.
 */
export function sphToVex(b1, b2) {
  return null;
}

/**
 * @param {BodyInfo} b1
 * @param {BodyInfo} b2
 * @returns {Vector3 | null} The point at which the two bodies are touching, or null if they are not touching.
 */
export function sphToCav(b1, b2) {
  return null;
}

/**
 * @param {BodyInfo} b1
 * @param {BodyInfo} b2
 * @returns {Vector3 | null} The point at which the two bodies are touching, or null if they are not touching.
 */
export function boxToVex(b1, b2) {
  return null;
}

/**
 * @param {BodyInfo} b1
 * @param {BodyInfo} b2
 * @returns {Vector3 | null} The point at which the two bodies are touching, or null if they are not touching.
 */
export function boxToCav(b1, b2) {
  return null;
}

/**
 * @param {BodyInfo} b1
 * @param {BodyInfo} b2
 * @returns {Vector3 | null} The point at which the two bodies are touching, or null if they are not touching.
 */
export function vexToCav(b1, b2) {
  return null;
}