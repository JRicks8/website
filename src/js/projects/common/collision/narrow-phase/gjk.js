/** @see https://realtimecollisiondetection.net/pubs/SIGGRAPH04_Ericson_GJK_notes.pdf */
// Also huge credit to Bullet3/PyBullet for their excellent physics engine that I've been using as an implementation reference for much of this.

import { BufferGeometry } from "three";
import { Vector3 } from "../../math/vector3.js";
import { Quaternion } from "../../math/quaternion.js";
import { Matrix3x3 } from "../../math/matrix3x3.js";
import { getPointsFromGeometry } from "../../util/three-utils.js";
import { MIN_DISTANCE } from "./continuous-convex.js";
import { cdSign } from "../../math/common.js";

/** @import {Transform} from "../../components/transform.js" */

/**
 * @typedef {object} SupportVector
 * @property {Vector3} supMinkowski
 * @property {Vector3} supA
 * @property {Vector3} supB
 */

/**
 * @typedef {object} Simplex
 * @property {SupportVector[]} points // Supporting points of relevant objects
 * @property {number} last // index of last added point
 */

/** 
 * @param {SupportVector} v
 * @returns {SupportVector}
 */
function getSupportVectorCopy(v) {
  return {
    supMinkowski: v.supMinkowski.getCopy(),
    supA: v.supA.getCopy(),
    supB: v.supB.getCopy()
  };
}

/**
 * Calculates the distance between a point and a line segment (two points)
 * @returns {number}
 * @param {Vector3} p
 * @param {Vector3} a
 * @param {Vector3} b
 * @param {Vector3} [witness] Used for tracking between distance checks to potentially make them faster
 */
function getPointDistFromSegment(p, a, b, witness) {
  const aToB = Vector3.subtract(b, a);
  const pToA = Vector3.subtract(a, p);

  let dist;

  const t = (-Vector3.dot(pToA, aToB)) / Vector3.dot(aToB, aToB);
  if (t <= 0) {
    dist = a.distanceToSquared(p);
    if (witness) witness.copy(a);
  } else if (t >= 1) {
    dist = b.distanceToSquared(p);
  } else if (witness) {
    witness.copy(aToB).multiply(t).addv3(a);
    dist = witness.distanceToSquared(p);
  } else {
    aToB.multiply(t).addv3(pToA);
    dist = Vector3.dot(aToB, aToB);
  }

  return dist;
}

/**
 * Calculates the distance between a point and a convex set of points forming a triangle
 * @see https://www.geometrictools.com/Documentation/DistancePoint3Triangle3.pdf
 * @param {Vector3} p
 * @param {Vector3} a
 * @param {Vector3} b
 * @param {Vector3} c
 * @param {Vector3} [witness] Used for tracking between distance checks to potentially make them faster
 */
function getPointDistFromTri(p, a, b, c, witness) {
  const d0 = Vector3.subtract(a, p);
  const d1 = Vector3.subtract(b, a);
  const d2 = Vector3.subtract(c, a);

  const d0MagSq = Vector3.dot(d0, d0); // Sqr magnitude is faster & still works here
  const d1MagSq = Vector3.dot(d1, d1);
  const d2MagSq = Vector3.dot(d2, d2);
  const d0DotD1 = Vector3.dot(d0, d1);
  const d0DotD2 = Vector3.dot(d0, d2);
  const d1DotD2 = Vector3.dot(d1, d2);

  const s = (d0DotD2 * d1DotD2 - d2MagSq * d0DotD1) / (d2MagSq * d1MagSq - d1DotD2 * d1DotD2);
  const t = (-s * d1DotD2 - d0DotD2) / d2MagSq;

  let dist;
  let witness2;

  if (s >= 0 && s <= 1 && t >= 0 && t <= 1 && t + s <= 1) {
    if (witness) {
      d1.multiply(s);
      d2.multiply(t);
      witness.copy(a);
      witness.addv3(d1, d2);

      dist = witness.distanceToSquared(p);
    } else {
      dist = s * s * d1MagSq;
      dist += t * t * d2MagSq;
      dist += 2 * s * t * d1DotD2;
      dist += 2 * s * d0DotD1;
      dist += 2 * t * d0DotD2;
      dist += d0MagSq;
    }
  } else {
    dist = getPointDistFromSegment(p, a, b, witness);

    let dist2 = getPointDistFromSegment(p, a, c, witness2);
    if (dist2 < dist) {
      dist = dist2;
      if (witness) witness.copy(witness2);
    }

    dist2 = getPointDistFromSegment(p, b, c, witness2);
    if (dist2 < dist) {
      dist = dist2;
      if (witness) witness.copy(witness2);
    }
  }

  return dist;
}

/**
 * @param {Simplex} simplex 
 * @param {SupportVector} supportVector 
 */
function addToSimplex(simplex, supportVector) {
  simplex.last++;
  simplex.points[simplex.last] = supportVector;
}

/**
 * @param {Simplex} simplex 
 * @param {number} size 
 */
function setSimplexSize(simplex, size) {
  simplex.last = size - 1;
}

/**
 * @param {Simplex} simplex 
 * @returns {number}
 */
function getSimplexSize(simplex) {
  return simplex.last + 1
}

/**
 * @param {Simplex} simplex 
 * @param {Vector3} dir 
 * @returns {1 | 0 | -1} 1 if contains origin, 0 if should continue, -1 if no intersection
 */
function testSimplex3(simplex, dir) {
  const A = simplex.points[2];
  const B = simplex.points[1];
  const C = simplex.points[0];

  // Check touching contact
  const dist = getPointDistFromTri(new Vector3(), A.supMinkowski, B.supMinkowski, C.supMinkowski);
  if (Math.abs(dist) < MIN_DISTANCE) return 1;

  // Check area > 0
  if (Vector3.equals(A.supMinkowski, B.supMinkowski) || Vector3.equals(A.supMinkowski, C.supMinkowski)) return -1;

  const AO = A.supMinkowski.getCopy().multiply(-1);

  const AB = Vector3.subtract(B.supMinkowski, A.supMinkowski);
  const AC = Vector3.subtract(C.supMinkowski, A.supMinkowski);
  const ABC = Vector3.cross(AB, AC);

  let dot = Vector3.dot(Vector3.cross(ABC, AC), AO);
  if (Math.abs(dot) < MIN_DISTANCE || dot > 0) {
    dot = Vector3.dot(AC, AO);

    if (Math.abs(dot) < MIN_DISTANCE || dot > 0) {
      // C is already in place
      simplex.points[1] = getSupportVectorCopy(A);
      setSimplexSize(simplex, 2);
      dir.copy(Vector3.tripleCross(AC, AO, AC));

    } else {
      dot = Vector3.dot(AB, AO);

      if (Math.abs(dot) < MIN_DISTANCE || dot > 0) {
        simplex.points[0] = getSupportVectorCopy(B);
        simplex.points[1] = getSupportVectorCopy(A);
        setSimplexSize(simplex, 2);
        dir.copy(Vector3.tripleCross(AB, AO, AB));

      } else {
        simplex.points[0] = getSupportVectorCopy(A);
        setSimplexSize(simplex, 1);
        dir.copy(AO);
      }
    }
  } else {
    dot = Vector3.dot(Vector3.cross(AB, ABC), AO);

    if (Math.abs(dot) < MIN_DISTANCE || dot > 0) {
      dot = Vector3.dot(AB, AO);

      if (Math.abs(dot) < MIN_DISTANCE || dot > 0) {
        simplex.points[0] = getSupportVectorCopy(B);
        simplex.points[1] = getSupportVectorCopy(A);
        setSimplexSize(simplex, 2);
        dir.copy(Vector3.tripleCross(AB, AO, AB));

      } else {
        simplex.points[0] = getSupportVectorCopy(A);
        setSimplexSize(simplex, 1);
        dir.copy(AO);
      }
    } else {
      dot = Vector3.dot(ABC, AO);
      
      if (Math.abs(dot) < MIN_DISTANCE || dot > 0) {
        dir.copy(ABC);

      } else {
        simplex.points[0] = getSupportVectorCopy(B);
        simplex.points[1] = getSupportVectorCopy(C);

        dir.copy(ABC).multiply(-1);
      }
    }
  }

  return 0;
}

/**
 * @param {Simplex} simplex 
 * @param {Vector3} dir 
 * @returns {1 | 0 | -1} 1 if contains origin, 0 if should continue, -1 if no intersection
 */
function testSimplex4(simplex, dir) {
  if (simplex.points.length < 4) {
    // TODO: remove this after testing this doesn't happen
    console.error('simplex length is less than four');
    return -1;
  }
  const A = simplex.points[3];
  const B = simplex.points[2];
  const C = simplex.points[1];
  const D = simplex.points[0];

  // Check that this is a valid tetrahedron, done by
  // finding dist from one point to the other 3 (as a triangle)
  let dist = getPointDistFromTri(A.supMinkowski, B.supMinkowski, C.supMinkowski, D.supMinkowski);
  if (dist === 0) return -1;

  // Does origin lie on tetrahedron faces? yes = intersect
  const origin = new Vector3();
  dist = getPointDistFromTri(origin, A.supMinkowski, B.supMinkowski, C.supMinkowski);
  if (Math.abs(dist) < MIN_DISTANCE)
    return 1;
  dist = getPointDistFromTri(origin, A.supMinkowski, C.supMinkowski, D.supMinkowski);
  if (Math.abs(dist) < MIN_DISTANCE)
    return 1;
  dist = getPointDistFromTri(origin, A.supMinkowski, B.supMinkowski, D.supMinkowski);
  if (Math.abs(dist) < MIN_DISTANCE)
    return 1;
  dist = getPointDistFromTri(origin, B.supMinkowski, C.supMinkowski, D.supMinkowski);
  if (Math.abs(dist) < MIN_DISTANCE)
    return 1;

  // Calc AO, AB, AC, AD segments and ABC, ACD, ADB normal vectors
  const AO = A.supMinkowski.getCopy().multiply(-1);
  const AB = Vector3.subtract(B.supMinkowski, A.supMinkowski);
  const AC = Vector3.subtract(C.supMinkowski, A.supMinkowski);
  const AD = Vector3.subtract(D.supMinkowski, A.supMinkowski);
  const ABC = Vector3.cross(AB, AC);
  const ACD = Vector3.cross(AC, AD);
  const ADB = Vector3.cross(AD, AB);

  // Side of B, C, D relative to planes ACD, ADB, and ABC respectively
  const BonACD = cdSign(Vector3.dot(ACD, AB));
  const ConADB = cdSign(Vector3.dot(ADB, AC));
  const DonABC = cdSign(Vector3.dot(ABC, AD));

  // Is origin on same side of ACD, ADB, ABC as B, C, D respectively
  const ABO = cdSign(Vector3.dot(ACD, AO)) === BonACD;
  const ACO = cdSign(Vector3.dot(ADB, AO)) === ConADB;
  const ADO = cdSign(Vector3.dot(ABC, AO)) === DonABC;

  if (ABO && ACO && ADO) {
    // Origin found in tetrahedron
    return 1;
    // Else, rearrange simplex4 to simplex3 and continue with triangle test
  } else if (!ABO) {
    // B is farthest, so replace it & continue as a triangle (same for rest of these conditions)
    simplex[2] = getSupportVectorCopy(A);
  } else if (!ACO) {
    // C is farthest
    simplex.points[1] = getSupportVectorCopy(D);
    simplex.points[0] = getSupportVectorCopy(B);
    simplex.points[2] = getSupportVectorCopy(A);
  } else {
    // D is farthest
    simplex.points[0] = getSupportVectorCopy(C);
    simplex.points[1] = getSupportVectorCopy(B);
    simplex.points[2] = getSupportVectorCopy(A);
  }
  setSimplexSize(simplex, 3);

  return testSimplex3(simplex, dir);
}

function testSimplex(simplex, dir) {
  const size = getSimplexSize(simplex);
  if (size === 3) {
    return testSimplex3(simplex, dir);
  } else {
    return testSimplex4(simplex, dir);
  }
}

export const GJK = {
  config: {
    maximumDistSquared: 1
  },

  /**
   * @param {Transform} transA 
   * @param {Transform} transB 
   * @param {BufferGeometry} geoA 
   * @param {BufferGeometry} geoB 
   */
  getClosestPoints(transA, transB, geoA, geoB) {
    let separatingDistance = 0;
    let distance = 0;
    const normalInB = new Vector3();

    let pointOnA, pointOnB;
    const positionOffset = Vector3.add(transA.position, transB.position).multiply(0.5);
    transA.position.subtractv3(positionOffset);
    transB.position.subtractv3(positionOffset);

    let it = 0;
    const maxIt = 1000;
    const cachedSepAxis = Vector3.up();

    let isValid = false;
    let checkSimplex = false;
    let checkPenetration = true;
    let degenerateSimplex = 0;

    let lastUsedMethod = -1;
    let status = -2;
    const orgNormalInB = new Vector3();

    let squaredDistance = Number.MAX_VALUE;
    let delta = 0;

    /** @type {Simplex} */
    const simplex = {
      points: [],
      last: -1
    };

    const dir = Vector3.right();

    const lastSup = new Vector3();
    const supAWorld = new Vector3();
    const supBWorld = new Vector3();
    // <----- Compute Supporting Point here

    /** @type {SupportVector} */
    const last = { // TODO: Make non-const and set to return value of computeSupportVector()
      supMinkowski: lastSup,
      supA: supAWorld,
      supB: supBWorld
    };

    // Add support vector to simplex
    addToSimplex(simplex, last);

    dir.copy(Vector3.multiply(lastSup, -1));

    // Main iterative loop for determining intersection
    for (let i = 0; i < maxIt; i++) {
      // <----- Compute Supporting Point here
      
      // If farthest point on Minkowski diff on dir is before the origin,
      // no intersection is happening
      const delta = Vector3.dot(lastSup, dir);
      if (delta < 0) {
        status = -1;
        break;
      }

      last.supMinkowski = lastSup;
      last.supA = supAWorld;
      last.supB = supBWorld;

      addToSimplex(simplex, last);

      const simplexOut = testSimplex(simplex, dir);

      if (simplexOut === 1) {
        status = 0;
        break;
      } else if (simplexOut === -1) {
        status = -1;
        break;
      }
    }

    if (status === 0) {
      console.log('SHAPES INTERSECT!!!!');
    } else if (status === -1) {
      console.log('They don\'t intersect...');
    }

    const matA = Quaternion.toMatrix(transA.orientation);
    const matB = Quaternion.toMatrix(transB.orientation);

    // Simplex iteration loop (finding closest points)
    while (true) {
      const sepA = Matrix3x3.multiplyVector3(matA, Vector3.multiply(cachedSepAxis, -1));
      const sepB = Matrix3x3.multiplyVector3(matB, cachedSepAxis);

      const pointsA = getPointsFromGeometry(geoA);
      const pointsB = getPointsFromGeometry(geoB);

      const pInA = this.getSupportingPoint(sepA, pointsA);
      const qInB = this.getSupportingPoint(sepB, pointsB);

      const pWorld = Vector3.dot3(pInA,
        new Vector3(matA[0], matA[1], matA[2]),
        new Vector3(matA[3], matA[4], matA[5]),
        new Vector3(matA[6], matA[7], matA[8])
      ).addv3(transA.position);
      const qWorld = Vector3.dot3(qInB,
        new Vector3(matB[0], matB[1], matB[2]),
        new Vector3(matB[3], matB[4], matB[5]),
        new Vector3(matB[6], matB[7], matB[8])
      ).addv3(transB.position);

      const w = Vector3.subtract(pWorld, qWorld);
      const delta = Vector3.dot(cachedSepAxis, w);

      // No overlap here
      if (delta > 0 && delta * delta > squaredDistance * this.config.maximumDistSquared) {
        degenerateSimplex = 10;
        checkSimplex = true;
        break;
      }

      // TODO ...
    }
  },
  
  /**
   * @param {Vector3} localDir 
   * @param {Vector3[]} points 
   * @returns {Vector3} The point with the maximal dot product
   */
  getSupportingPoint(localDir, points) {
    let max;
    let maxDot = Number.MIN_VALUE;
    for (let i = 0; i < points.length; i++) {
      const dot = Vector3.dot(points[i], localDir);

      if (dot > maxDot) {
        maxDot = dot;
        max = points[i];
      }
    }

    return max;
  }
}