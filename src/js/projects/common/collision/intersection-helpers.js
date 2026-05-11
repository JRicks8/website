import { BoxColliderComponent } from "../components/collider/box-collider.js";
import { Vector3 } from "../math/vector3.js";
import { getWorldPosition } from "../util/transform-utils.js";
import { sign } from "../math/common.js";
import { DebugProcess } from "../processes/debug-process.js";

/**
 * Tests a specified axis for separation between two boxes.
 * @see https://www.geometrictools.com/Documentation/DynamicCollisionDetection.pdf
 * @param {any} A
 * @param {any} B
 * @param {Vector3} L
 * @param {Vector3} D
 * @returns {boolean} True if the half extents of the boxes, when projected onto L, do not overlap.
 */
function boxSAT(A, B, L, D) {
  return Math.abs(Vector3.dot(L, D)) > 
    (A.a0 * sign(Vector3.dot(L, A.A0)) * Vector3.dot(L, A.A0)) + (B.b0 * sign(Vector3.dot(L, B.B0)) * Vector3.dot(L, B.B0))
    + (A.a1 * sign(Vector3.dot(L, A.A1)) * Vector3.dot(L, A.A1)) + (B.b1 * sign(Vector3.dot(L, B.B1)) * Vector3.dot(L, B.B1))
    + (A.a2 * sign(Vector3.dot(L, A.A2)) * Vector3.dot(L, A.A2)) + (B.b2 * sign(Vector3.dot(L, B.B2)) * Vector3.dot(L, B.B2));
}

/**
 * Returns all axes that the boxes intersect on (if any).
 * @see https://www.geometrictools.com/Documentation/DynamicCollisionDetection.pdf
 * @param {BoxColliderComponent} c0
 * @param {BoxColliderComponent} c1
 * @returns {{ intersecting: boolean, axes: Vector3[] }}
 */
export function testBoxBoxIntersection(c0, c1) {
  const C0Transform = c0.entity?.transform;
  const C1Transform = c1.entity?.transform;
  if (!C0Transform || !C1Transform) return { intersecting: false, axes: []};

  const A = {
    C: getWorldPosition(C0Transform),
    A0: Vector3.right.rotate(C0Transform.orientation),
    A1: Vector3.up.rotate(C0Transform.orientation),
    A2: Vector3.forward.rotate(C0Transform.orientation),
    a0: c0.geometry.parameters.width / 2,
    a1: c0.geometry.parameters.height / 2,
    a2: c0.geometry.parameters.depth / 2
  };
  
  const B = {
    C: getWorldPosition(C1Transform),
    B0: Vector3.right.rotate(C1Transform.orientation),
    B1: Vector3.up.rotate(C1Transform.orientation),
    B2: Vector3.forward.rotate(C1Transform.orientation),
    b0: c1.geometry.parameters.width / 2,
    b1: c1.geometry.parameters.height / 2,
    b2: c1.geometry.parameters.depth / 2
  };

  // Potential separating axes are of the form C0 + sL where L is one of Ai, Bj, or Ai x Bj.
  // Translation: Axes to test on are each of the directions A or B, or the cross product of the two. (15 possible)
  // This takes roughly 0.035 ms in worst case scenario, on my machine

  const axes = [
    A.A0,
    A.A1,
    A.A2,
    B.B0,
    B.B1,
    B.B2,
    Vector3.cross(A.A0, B.B0),
    Vector3.cross(A.A0, B.B1),
    Vector3.cross(A.A0, B.B2),
    Vector3.cross(A.A1, B.B0),
    Vector3.cross(A.A1, B.B1),
    Vector3.cross(A.A1, B.B2),
    Vector3.cross(A.A2, B.B0),
    Vector3.cross(A.A2, B.B1),
    Vector3.cross(A.A2, B.B2)
  ];

  const D = Vector3.subtract(B.C, A.C);

  let intersectingAxes = [];
  for (const axis of axes)
    if (!boxSAT(A, B, axis, D))
      intersectingAxes.push(axis);
  
  return {
    intersecting: intersectingAxes.length === 15,
    axes: intersectingAxes
  };
}