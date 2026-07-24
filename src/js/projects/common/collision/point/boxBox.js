import { BoxGeometry } from "three";
import { sign } from "../../math/common.js";
import { Vector3 } from "../../math/vector3.js";

/** @import {BodyInfo} from "../../processes/physics-process.js" */

/** 
 * @typedef {Object} AxisInfo
 * @property {Vector3} [A]
 * @property {Vector3} [B]
 * @property {number} [i]
 * @property {number} [j]
 * @property {number} id
 * @property {Vector3} axis
 */

/**
 * Tests a specified axis for separation between two boxes.
 * @see https://www.geometrictools.com/Documentation/DynamicCollisionDetection.pdf
 * @param {any} A Box information
 * @param {any} B Box information
 * @param {Vector3} L Test axis
 * @param {Vector3} D Direction from A to B
 * @returns {boolean} True if the half extents of the boxes, when projected onto L, do not overlap.
 */
function boxSAT(A, B, L, D) {
  return Math.abs(Vector3.dot(L, D)) > 
    (A.a0 * sign(Vector3.dot(L, A.A0)) * Vector3.dot(L, A.A0)) + (B.b0 * sign(Vector3.dot(L, B.B0)) * Vector3.dot(L, B.B0))
    + (A.a1 * sign(Vector3.dot(L, A.A1)) * Vector3.dot(L, A.A1)) + (B.b1 * sign(Vector3.dot(L, B.B1)) * Vector3.dot(L, B.B1))
    + (A.a2 * sign(Vector3.dot(L, A.A2)) * Vector3.dot(L, A.A2)) + (B.b2 * sign(Vector3.dot(L, B.B2)) * Vector3.dot(L, B.B2));
}

/**
 * Returns the first axis that the boxes are separated by (if any).
 * The boxes are separated if there exists a separating axis.
 * @see https://www.geometrictools.com/Documentation/DynamicCollisionDetection.pdf
 * @param {BodyInfo} b1
 * @param {BodyInfo} b2
 * @returns {AxisInfo | null}
 */
export function testBoxBoxIntersection(b1, b2) {
  const b1Geo = /** @type {BoxGeometry} */ (b1.geometry);
  const A = {
    C: b1.state.position,
    A0: Vector3.right().rotate(b1.state.orientation),
    A1: Vector3.up().rotate(b1.state.orientation),
    A2: Vector3.forward().rotate(b1.state.orientation),
    a0: b1Geo.parameters.width / 2,
    a1: b1Geo.parameters.height / 2,
    a2: b1Geo.parameters.depth / 2
  };
  
  const b2Geo = /** @type {BoxGeometry} */ (b1.geometry);
  const B = {
    C: b2.state.position,
    B0: Vector3.right().rotate(b2.state.orientation),
    B1: Vector3.up().rotate(b2.state.orientation),
    B2: Vector3.forward().rotate(b2.state.orientation),
    b0: b2Geo.parameters.width / 2,
    b1: b2Geo.parameters.height / 2,
    b2: b2Geo.parameters.depth / 2
  };

  // Potential separating axes are of the form C0 + sL where L is one of Ai, Bj, or Ai x Bj.
  // Translation: Axes to test on are each of the directions A or B, or the cross product of the two. (15 possible)
  // This takes roughly 0.035 ms in worst case scenario, on my machine

  /** @type {AxisInfo[]} */
  const axes = [
    { axis: A.A0, A: A.A0, i: 0, id: 0 },
    { axis: A.A1, A: A.A1, i: 1, id: 1 },
    { axis: A.A2, A: A.A2, i: 2, id: 2 },
    { axis: B.B0, B: B.B0, j: 0, id: 3 },
    { axis: B.B1, B: B.B1, j: 1, id: 4 },
    { axis: B.B2, B: B.B2, j: 2, id: 5 },
    { axis: Vector3.cross(A.A0, B.B0), A: A.A0, i: 0, B: B.B0, j: 0, id: 6 },
    { axis: Vector3.cross(A.A0, B.B1), A: A.A0, i: 0, B: B.B1, j: 1, id: 7 },
    { axis: Vector3.cross(A.A0, B.B2), A: A.A0, i: 0, B: B.B2, j: 2, id: 8 },
    { axis: Vector3.cross(A.A1, B.B0), A: A.A1, i: 1, B: B.B0, j: 0, id: 9 },
    { axis: Vector3.cross(A.A1, B.B1), A: A.A1, i: 1, B: B.B1, j: 1, id: 10 },
    { axis: Vector3.cross(A.A1, B.B2), A: A.A1, i: 1, B: B.B2, j: 2, id: 11 },
    { axis: Vector3.cross(A.A2, B.B0), A: A.A2, i: 2, B: B.B0, j: 0, id: 12 },
    { axis: Vector3.cross(A.A2, B.B1), A: A.A2, i: 2, B: B.B1, j: 1, id: 13 },
    { axis: Vector3.cross(A.A2, B.B2), A: A.A2, i: 2, B: B.B2, j: 2, id: 14 }
  ];

  const D = Vector3.subtract(B.C, A.C);

  for (const axis of axes) {
    if (boxSAT(A, B, axis.axis, D)) {
      return axis;
    }
  }
  
  return null;
}

/**
 * Finds the point of intersection between the two boxes.
 * Does not factor for linear or angular velocity.
 * @see https://www.geometrictools.com/Documentation/DynamicCollisionDetection.pdf
 * @param {BodyInfo} b0
 * @param {BodyInfo} b1
 * @param {AxisInfo} axis Information regarding the last axis of separation between the two boxes
 * @returns {Vector3} The point at which the two bodies are touching.
 */
export function getBoxBoxPoint(b0, b1, axis) {

  console.log(axis);

  return null;
}