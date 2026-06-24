/** @see https://realtimecollisiondetection.net/pubs/SIGGRAPH04_Ericson_GJK_notes.pdf */

import { BufferGeometry, Vector3 as ThreeV3 } from "three";
import { Vector3 } from "../../math/vector3.js";
import { Quaternion } from "../../math/quaternion.js";
import { Matrix3x3 } from "../../math/matrix3x3.js";
import { getPointsFromGeometry } from "../../util/three-utils.js";
import { getWorldPosition } from "../../util/transform-utils.js";

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
 * @param {Vector3} dir 
 * @returns {number} 1 if contains origin, 0 if should continue, -1 if no intersection
 */
function testSimplex(simplex, dir) {
  const a = simplex.points[3];
  const b = simplex.points[2];
  const c = simplex.points[1];
  const d = simplex.points[0];

  // Check that this is a valid tetrahedron, done by
  // finding dist of one point from the others
  const dist = getPointDistFromTri(a.supMinkowski, b.supMinkowski, c.supMinkowski, d.supMinkowski);
  if (dist === 0) return -1;
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