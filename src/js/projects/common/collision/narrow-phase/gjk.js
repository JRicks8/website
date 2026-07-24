/** @see https://realtimecollisiondetection.net/pubs/SIGGRAPH04_Ericson_GJK_notes.pdf */
// Also huge credit to Bullet3/PyBullet for their excellent physics engine that I've been using as an implementation reference for much of this.

import { BufferGeometry, Color } from "three";
import { Vector3 } from "../../math/vector3.js";
import { Quaternion } from "../../math/quaternion.js";
import { Matrix3x3 } from "../../math/matrix3x3.js";
import { getPointsFromGeometry } from "../../util/three-utils.js";
import { cdSign } from "../../math/common.js";
import { applyTransform, applyTransform2, getTransformCopy } from "../../util/transform-utils.js";
import { VoronoiSimplexSolver } from "./voronoi-simplex.js";
import { BIG_NUMBER, MIN_DISTANCE, SMALL_NUMBER } from "../constants.js";
import { DebugProcess } from "../../processes/debug-process.js";

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
export function addToSimplex(simplex, supportVector) {
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
function testSimplex2(simplex, dir) {
  const A = simplex.points[1];
  const B = simplex.points[0];

  // compute AB oriented segment
  const AB = Vector3.subtract(B.supMinkowski, A.supMinkowski);
  // compute AO vector
  const AO = A.supMinkowski.getCopy();
  AO.multiply(-1);

  const dot = Vector3.dot(AB, AO);

  // check that origin doesn't lie on AB segment
  const tmp = Vector3.cross(AB, AO);
  if (Math.abs(Vector3.dot(tmp, tmp)) < MIN_DISTANCE && dot > 0) {
    return 1;
  }

  // check if origin is in area where AB segment is
  if (Math.abs(dot) < MIN_DISTANCE || dot < 0) {
    // origin is in outside area of A
    simplex.points[0] = getSupportVectorCopy(A);
    setSimplexSize(simplex, 1);
    dir.copy(AO);
  } else {
    // origin is in area where AB segment is

    // keep simplex untouched and set direction to 
    // AB x AO x AB
    dir.copy(Vector3.tripleCross(AB, AO, AB));
  }

  return 0;
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
 * @returns { 1 | 0 | -1 }
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

/**
 * @param {Simplex} simplex 
 * @param {Vector3} dir 
 * @returns { 1 | 0 | -1 } 1 if contains origin, 0 if should continue, -1 if no intersection
 */
export function testSimplex(simplex, dir) {
  const size = getSimplexSize(simplex);
  if (size === 2) {
    return testSimplex2(simplex, dir);
  } else if (size === 3) {
    return testSimplex3(simplex, dir);
  } else {
    return testSimplex4(simplex, dir);
  }
}
  
/**
 * @param {Vector3} localDir 
 * @param {Vector3[]} points 
 * @returns {Vector3} The point with the maximal dot product
 */
export function getLocalSupportPoint(localDir, points) {
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

/**
 * @param {Vector3} positionA
 * @param {Matrix3x3} matA
 * @param {Vector3[]} convexA
 * @param {Vector3} positionB
 * @param {Matrix3x3} matB
 * @param {Vector3[]} convexB
 * @param {Vector3} dir
 * @returns {SupportVector}
 */
export function computeSupportVector(positionA, matA, convexA, positionB, matB, convexB, dir) {
  const separatingAxisInA = Matrix3x3.multiplyVector3(matA.getCopy().transpose(), dir);
  const separatingAxisInB = Matrix3x3.multiplyVector3(matB.getCopy().transpose(), Vector3.multiply(dir, -1));
  // const separatingAxisInA = Vector3.rotate(dir, localTransA.orientation);
  // const separatingAxisInB = Vector3.rotate(Vector3.multiply(dir, -1), localTransB.orientation);

  const pInA = getLocalSupportPoint(separatingAxisInA, convexA);
  const qInB = getLocalSupportPoint(separatingAxisInB, convexB);

  const supAWorld = applyTransform2(pInA, positionA, matA);
  const supBWorld = applyTransform2(qInB, positionB, matB);
  // const supAWorld = applyTransform(pInA, localTransA);
  // const supBWorld = applyTransform(qInB, localTransA);
  const aMinB = Vector3.subtract(supAWorld, supBWorld);
  
  DebugProcess.drawLine({
    points: [new Vector3(), dir.normalized],
    color: new Color(0xff8000),
    size: 2
  });
  DebugProcess.drawLine({
    points: [new Vector3(), Vector3.multiply(dir, -1).normalized],
    color: new Color(0x0080ff),
    size: 2
  });
  // DebugProcess.drawLine({
  //   points: [new Vector3().addv3(positionA), Vector3.add(separatingAxisInA.normalized, positionA)],
  //   color: new Color(0xff8000),
  //   size: 2
  // });
  // DebugProcess.drawLine({
  //   points: [new Vector3().addv3(positionB), Vector3.add(Vector3.multiply(separatingAxisInB, -1).normalized, positionB)],
  //   color: new Color(0x0080ff),
  //   size: 2
  // });
  DebugProcess.drawPoints({ points: [supAWorld], color: new Color(0x80ff00), size: 0.1, attenuation: true });
  DebugProcess.drawPoints({ points: [supBWorld], color: new Color(0x0080ff), size: 0.1, attenuation: true });
  DebugProcess.drawPoints({ points: [aMinB], color: new Color(0xff8080), size: 0.1, attenuation: true });

  return {
    supMinkowski: aMinB,
    supA: supAWorld,
    supB: supBWorld
  };
}

export class PointCollector {
  /** @type {Vector3} */
  normalOnBInWorld;
  /** @type {Vector3} */
  pointInWorld;
  distance = BIG_NUMBER;

  hasResult = false;

  /**
   * @param {Vector3} normalonBInWorld 
   * @param {Vector3} pointInWorld 
   * @param {number} depth 
   */
  addContactPoint(normalonBInWorld, pointInWorld, depth) {
    if (depth < this.distance) {
      this.hasResult = true;
      this.normalonBInWorld = normalonBInWorld;
      this.pointInWorld = pointInWorld;
      this.distance = depth;
    }
  }
}

export class GJK {
  cachedSeparatingDistance = 0;
  /** @type {Vector3[]} */
  convexSetA = [];
  /** @type {Vector3[]} */
  convexSetB = [];
  curIter = 0;
  degenerateSimplex = 0;
  lastUsedMethod = -1;

  config = {
    maximumDistSquared: 1
  };

  /**
   * @param {Transform} transA 
   * @param {Transform} transB 
   * @param {BufferGeometry} geoA 
   * @param {BufferGeometry} geoB 
   * @param {VoronoiSimplexSolver} simplexSolver
   * @param {PointCollector} output
   */
  getClosestPoints(transA, transB, geoA, geoB, simplexSolver, output) {
    let distance = 0;

    const positionOffset = Vector3.add(transA.position, transB.position).multiply(0.5);
    const localTransA = getTransformCopy(transA);
    localTransA.position.subtractv3(positionOffset);
    const localTransB = getTransformCopy(transB);
    localTransB.position.subtractv3(positionOffset);

    const matA = Quaternion.toMatrix(localTransA.orientation);
    const matB = Quaternion.toMatrix(localTransB.orientation);

    const maxIt = 1000;
    const cachedSepAxis = Vector3.up();

    let isValid = false;
    let checkSimplex = false;
    // let checkPenetration = true;

    let status = -2;

    let squaredDistance = Number.MAX_VALUE;
    let delta = 0;

    /** @type {Simplex} */
    const simplex = {
      points: [],
      last: -1
    };

    const dir = Vector3.right();
    this.convexSetA = getPointsFromGeometry(geoA);
    this.convexSetB = getPointsFromGeometry(geoB);
    let last = computeSupportVector(
      localTransA.position, matA, this.convexSetA,
      localTransB.position, matB, this.convexSetB,
      dir
    );

    addToSimplex(simplex, last);

    dir.copy(Vector3.multiply(last.supMinkowski, -1));

    // Main iterative loop for determining intersection
    for (let i = 0; i < maxIt; i++) {
      last = computeSupportVector(
        localTransA.position, matA, this.convexSetA,
        localTransB.position, matB, this.convexSetB,
        dir
      );
      
      // If farthest point on Minkowski diff on dir is before the origin,
      // no intersection is happening
      delta = Vector3.dot(last.supMinkowski, dir);
      if (delta < 0) {
        status = -1;
        break;
      }

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

    simplexSolver.reset();
    if (status === 0) {
      console.log('SHAPES INTERSECT!!!!');
    } else if (status === -1) {
      console.log('They don\'t intersect...');
    }

    // Simplex iteration loop (finding closest points)
    while (true) {
      const sepA = Matrix3x3.multiplyVector3(matA, Vector3.multiply(cachedSepAxis, -1));
      const sepB = Matrix3x3.multiplyVector3(matB, cachedSepAxis);

      const pointsA = getPointsFromGeometry(geoA);
      const pointsB = getPointsFromGeometry(geoB);

      const pInA = getLocalSupportPoint(sepA, pointsA);
      const qInB = getLocalSupportPoint(sepB, pointsB);

      const pWorld = applyTransform2(pInA, localTransA.position, matA);
      const qWorld = applyTransform2(qInB, localTransB.position, matB);

      const w = Vector3.subtract(pWorld, qWorld);
      delta = Vector3.dot(cachedSepAxis, w);

      // No overlap here
      if (delta > 0 && delta * delta > squaredDistance * this.config.maximumDistSquared) {
        this.degenerateSimplex = 10;
        checkSimplex = true;
        break;
      }

      // New point in simplex, or not any closer than before
      if (simplexSolver.inSimplex(w)) {
        this.degenerateSimplex = 1;
        checkSimplex = true;
        break;
      }

      // are we getting any closer?
      const f0 = squaredDistance - delta;
      const f1 = squaredDistance * SMALL_NUMBER;

      if (f0 <= f1) {
        if (f0 <= 0) this.degenerateSimplex = 2;
        else this.degenerateSimplex = 11;
        checkSimplex = true;
        break;
      }

      // add current vertex to simplex
      simplexSolver.addVertex(w, pWorld, qWorld);
      const newCachedSeparatingAxis = new Vector3();

      // calculate the closest point to the origin (update vector v)
      if (!simplexSolver.closest(newCachedSeparatingAxis)) {
        this.degenerateSimplex = 3;
        checkSimplex = true;
        break;
      }

      if (newCachedSeparatingAxis.sqrMagnitude < SMALL_NUMBER) {
        this.cachedSeparatingAxis = newCachedSeparatingAxis;
        this.degenerateSimplex = 6;
        checkSimplex = true;
        break;
      }

      const previousSquaredDistance = squaredDistance;
      squaredDistance = newCachedSeparatingAxis.sqrMagnitude;

      // are we getting any closer?
      if (previousSquaredDistance - squaredDistance <= MIN_DISTANCE * previousSquaredDistance) {
        checkSimplex = true;
        this.degenerateSimplex = 12;
        break;
      }

      this.cachedSeparatingAxis = newCachedSeparatingAxis;

      // degeneracy, this is typically due to invalid transforms
      if (this.curIter++ > maxIt) {
        console.warn('max iterations exceeded', this.curIter);
        console.warn(`sepAxis=${this.cachedSeparatingAxis.toString()}, squaredDistance=${squaredDistance}`);
        break;
      }

      const check = !simplexSolver.fullSimplex();

      if (!check) {
        this.degenerateSimplex = 13;
        break;
      }
    }

    /** @type {Vector3} */
    let normalInB;
    /** @type {Vector3} */
    let orgNormalInB;
    const pointOnA = new Vector3();
    const pointOnB = new Vector3();
    if (checkSimplex) {
      simplexSolver.computePoints(pointOnA, pointOnB);
      normalInB = this.cachedSeparatingAxis.getCopy();

      const lenSqr = this.cachedSeparatingAxis.sqrMagnitude;

      // valid normal
      if (lenSqr < SMALL_NUMBER) {
        this.degenerateSimplex = 5;
      }
      if (lenSqr > MIN_DISTANCE * MIN_DISTANCE) {
        const rlen = 1 / Math.sqrt(lenSqr);
        normalInB.multiply(rlen); // normalize

        const s = Math.sqrt(squaredDistance);

        if (s <= 0) console.error('uh oh');
        distance = 1 / rlen;
        isValid = true;
        orgNormalInB = normalInB.getCopy();

        this.lastUsedMethod = 1;
      } else {
        this.lastUsedMethod = 2;
      }
    }

    // TODO: Solve for penetration here

    if (isValid && (distance < 0 || distance * distance < this.config.maximumDistSquared)) {
      this.cachedSeparatingAxis = normalInB;
      this.cachedSeparatingDistance = distance;
      
      let d2 = 0;
      {
        const separatingAxisInA = Matrix3x3.multiplyVector3(matA, Vector3.multiply(orgNormalInB, -1));
        const separatingAxisInB = Matrix3x3.multiplyVector3(matB, orgNormalInB);

        const pInA = getLocalSupportPoint(separatingAxisInA, this.convexSetA);
        const qInB = getLocalSupportPoint(separatingAxisInB, this.convexSetB);

        const pWorld = applyTransform2(pInA, localTransA.position, matA);
        const qWorld = applyTransform2(qInB, localTransB.position, matB);
        const w = Vector3.subtract(pWorld, qWorld);
        d2 = Vector3.dot(orgNormalInB, w);
      }

      let d1 = 0;
      {
        const separatingAxisInA = Matrix3x3.multiplyVector3(matA, normalInB);
        const separatingAxisInB = Matrix3x3.multiplyVector3(matB, Vector3.multiply(normalInB, -1));

        const pInA = getLocalSupportPoint(separatingAxisInA, this.convexSetA);
        const qInB = getLocalSupportPoint(separatingAxisInB, this.convexSetB);

        const pWorld = applyTransform2(pInA, localTransA.position, matA);
        const qWorld = applyTransform2(qInB, localTransB.position, matB);
        const w = Vector3.subtract(pWorld, qWorld);
        d1 = Vector3.dot(Vector3.multiply(normalInB, -1), w);
      }

      let d0 = 0;
      {
        const separatingAxisInA = Matrix3x3.multiplyVector3(matA, Vector3.multiply(normalInB, -1));
        const separatingAxisInB = Matrix3x3.multiplyVector3(matB, normalInB);

        const pInA = getLocalSupportPoint(separatingAxisInA, this.convexSetA);
        const qInB = getLocalSupportPoint(separatingAxisInB, this.convexSetB);

        const pWorld = applyTransform2(pInA, localTransA.position, matA);
        const qWorld = applyTransform2(qInB, localTransB.position, matB);
        const w = Vector3.subtract(pWorld, qWorld);
        d0 = Vector3.dot(normalInB, w);
      }

      if (d1 > d0) {
        this.lastUsedMethod = 10;
        normalInB.multiply(-1);
      }

      if (orgNormalInB.sqrMagnitude && d2 > d0 && d2 > d1 && d2 > distance) {
        normalInB.copy(orgNormalInB);
        distance = d2;
      }

      output.addContactPoint(
        normalInB,
        Vector3.add(pointOnB, positionOffset),
        distance
      );
    } else {
      console.error('oops');
    }
  }
}