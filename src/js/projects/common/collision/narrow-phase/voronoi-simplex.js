/*
  Implementation of this algorithm has been obtained and altered for this application from:
  Bullet Continuous Collision Detection and Physics Library
  Copyright (c) 2003-2006 Erwin Coumans  https://bulletphysics.org
*/

import { Vector3 } from "../../math/vector3.js";
import { SMALL_NUMBER } from "../constants.js";

class UsageTracker {
  usedVertexA = true;
  usedVertexB = true;
  usedVertexC = true;
  usedVertexD = true;

  reset() {
    this.usedVertexA = false;
    this.usedVertexB = false;
    this.usedVertexC = false;
    this.usedVertexD = false;
  }
}

class SubSimplexClosestResult {
  /** @type {Vector3} */
  closestPointOnSimplex;
  /** @type {UsageTracker} */
  usedVertices;
  /** @type {number[]} */
  barycentricCoords;
  /** @type {boolean} */
  degenerate;

  reset() {
    this.degenerate = false;
    this.setBarycentricCoordinates();
    this.usedVertices.reset();
  }

  isValid() {
    return this.barycentricCoords[0] >= 0
      && this.barycentricCoords[1] >= 0
      && this.barycentricCoords[2] >= 0
      && this.barycentricCoords[3] >= 0;
  }

  /**
   * 
   * @param {number} a 
   * @param {number} b 
   * @param {number} c 
   * @param {number} d 
   */
  setBarycentricCoordinates(a = 0, b = 0, c = 0, d = 0) {
    this.barycentricCoords[0] = a;
    this.barycentricCoords[1] = b;
    this.barycentricCoords[2] = c;
    this.barycentricCoords[3] = d;
  }
}

export class VoronoiSimplexSolver {
  numVertices = 0;

  /** @type {Vector3[]} */
  simplexVectorW = [];
  /** @type {Vector3[]} */
  simplexPointsP = [];
  /** @type {Vector3[]} */
  simplexPointsQ = [];

  /** @type {Vector3} */
  cachedP1;
  /** @type {Vector3} */
  cachedP2;
  /** @type {Vector3} */
  cachedV;
  /** @type {Vector3} */
  lastW;

  /** @type {number} */
  equalVertexThreshold = SMALL_NUMBER;
  /** @type {boolean} */
  cachedValidClosest;

  /** @type {SubSimplexClosestResult} */
  cachedBC;

  /** @type {boolean} */
  needsUpdate;

  fullSimplex() {
    return this.numVertices === 4;
  }

  /** @param {number} index */
  removeVertex(index) {
    if (this.numVertices <= 0) return;
    this.numVertices--;
    this.simplexVectorW[index] = this.simplexVectorW[this.numVertices];
    this.simplexPointsP[index] = this.simplexPointsP[this.numVertices];
    this.simplexPointsQ[index] = this.simplexPointsQ[this.numVertices];
  }

  /** @param {UsageTracker} usedVerts */
  reduceVertices(usedVerts) {
    if (this.numVertices >= 4 && !usedVerts.usedVertexD) this.removeVertex(3);
    if (this.numVertices >= 3 && !usedVerts.usedVertexC) this.removeVertex(2);
    if (this.numVertices >= 2 && !usedVerts.usedVertexB) this.removeVertex(1);
    if (this.numVertices >= 1 && !usedVerts.usedVertexA) this.removeVertex(0);
  }

  reset() {
    this.cachedValidClosest = false;
    this.numVertices = 0;
    this.needsUpdate = true;
    this.lastW = new Vector3(Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY);
    this.cachedBC.reset();
  }

  /**
   * @param {Vector3} w 
   * @param {Vector3} p 
   * @param {Vector3} q 
   */
  addVertex(w, p, q) {
    this.lastW = w;
    this.needsUpdate = true;

    this.simplexVectorW[this.numVertices] = w;
    this.simplexPointsP[this.numVertices] = p;
    this.simplexPointsQ[this.numVertices] = q;

    this.numVertices++;
  }

  /** @returns {boolean} */
  updateClosestVectorAndPoints() {
    if (this.needsUpdate) {
      this.cachedBC.reset();

      this.needsUpdate = false;

      switch (this.numVertices) {
        case 0:
          this.cachedValidClosest = false;
          break;
        case 1:
          this.cachedP1 = this.simplexPointsP[0];
          this.cachedP2 = this.simplexPointsQ[0];
          this.cachedV = Vector3.subtract(this.cachedP1, this.cachedP2);
          this.cachedBC.reset();
          this.cachedBC.setBarycentricCoordinates(1, 0, 0, 0);
          this.cachedValidClosest = this.cachedBC.isValid();
          break;
        case 2:
        {
          // closest point origin from line segment
          const from = this.simplexVectorW[0];
          const to = this.simplexVectorW[1];

          const p = new Vector3(0, 0, 0);
          const diff = Vector3.subtract(p, from);
          const v = Vector3.subtract(to, from);
          let t = Vector3.dot(v, diff);

          if (t > 0) {
            const dotVV = Vector3.dot(v, v);
            if (t < dotVV) {
              t /= dotVV;
              diff.subtractv3(Vector3.multiply(v, t));
              this.cachedBC.usedVertices.usedVertexA = true;
              this.cachedBC.usedVertices.usedVertexB = true;
            
            } else {
              t = 1;
              diff.subtractv3(v);
              // reduce to 1 point
              this.cachedBC.usedVertices.usedVertexB = true;
            }

          } else {
            t = 0;
            // reduce to 1 point
            this.cachedBC.usedVertices.usedVertexA = true;
          }
          this.cachedBC.setBarycentricCoordinates(1 - t, t);

          const vdiff = Vector3.subtract(this.simplexPointsP[1], this.simplexPointsP[0]);
          this.cachedP1 = Vector3.add(this.simplexPointsP[0], Vector3.multiply(vdiff, t));
          this.cachedP2 = Vector3.add(this.simplexPointsQ[0], Vector3.multiply(vdiff, t));
          this.cachedV = Vector3.subtract(this.cachedP1, this.cachedP2);

          this.reduceVertices(this.cachedBC.usedVertices);

          this.cachedValidClosest = this.cachedBC.isValid();
          break;
        }
        case 3:
        {
          // closest point origin from triangle
          const p = new Vector3();

          const a = this.simplexVectorW[0];
          const b = this.simplexVectorW[1];
          const c = this.simplexVectorW[2];

          this.closestPtPointTriangle(p, a, b, c, this.cachedBC);
          this.cachedP1 = Vector3.add(
            Vector3.multiply(this.simplexPointsP[0], this.cachedBC.barycentricCoords[0]),
            Vector3.multiply(this.simplexPointsP[1], this.cachedBC.barycentricCoords[1]),
            Vector3.multiply(this.simplexPointsP[2], this.cachedBC.barycentricCoords[2])
          );
          this.cachedP2 = Vector3.add(
            Vector3.multiply(this.simplexPointsQ[0], this.cachedBC.barycentricCoords[0]),
            Vector3.multiply(this.simplexPointsQ[1], this.cachedBC.barycentricCoords[1]),
            Vector3.multiply(this.simplexPointsQ[2], this.cachedBC.barycentricCoords[2])
          );

          this.cachedV = Vector3.subtract(this.cachedP1, this.cachedP2);

          this.reduceVertices(this.cachedBC.usedVertices);
          this.cachedValidClosest = this.cachedBC.isValid();

          break;
        }
        case 4:
        {
          const p = new Vector3();

          const a = this.simplexVectorW[0];
          const b = this.simplexVectorW[1];
          const c = this.simplexVectorW[2];
          const d = this.simplexVectorW[3];

          const hasSeparation = this.closestPtPointTetrahedron(p, a, b, c, d, this.cachedBC);

          if (hasSeparation) {
            this.cachedP1 = Vector3.add(
              Vector3.multiply(this.simplexPointsP[0], this.cachedBC.barycentricCoords[0]),
              Vector3.multiply(this.simplexPointsP[1], this.cachedBC.barycentricCoords[1]),
              Vector3.multiply(this.simplexPointsP[2], this.cachedBC.barycentricCoords[2]),
              Vector3.multiply(this.simplexPointsP[2], this.cachedBC.barycentricCoords[3])
            );
            this.cachedP2 = Vector3.add(
              Vector3.multiply(this.simplexPointsQ[0], this.cachedBC.barycentricCoords[0]),
              Vector3.multiply(this.simplexPointsQ[1], this.cachedBC.barycentricCoords[1]),
              Vector3.multiply(this.simplexPointsQ[2], this.cachedBC.barycentricCoords[2]),
              Vector3.multiply(this.simplexPointsQ[2], this.cachedBC.barycentricCoords[3])
            );

            this.cachedV = Vector3.subtract(this.cachedP1, this.cachedP2);
            this.reduceVertices(this.cachedBC.usedVertices);
          
          } else {
            if (this.cachedBC.degenerate) {
              this.cachedValidClosest = false;
            } else {
              this.cachedValidClosest = true;
              this.cachedV.set(0, 0, 0);
            }
            break;
          }

          this.cachedValidClosest = this.cachedBC.isValid();
          break;
        }
        default:
          this.cachedValidClosest = false;
      }
    }

    return this.cachedValidClosest;
  }

  /**
   * Calculates the closest vertex to the simplex and writes to `v`
   * @param {Vector3} v 
   * @returns Success of the operation
   */
  closest(v) {
    const success = this.updateClosestVectorAndPoints();
    v.copy(this.cachedV);
    return success;
  }

  maxVertex() {
    let maxV = 0;
    for (let i = 0; i < this.numVertices; i++) {
      const sqrMag = this.simplexVectorW[i].sqrMagnitude;
      if (maxV < sqrMag) maxV = sqrMag;
    }
    return maxV;
  }

  /**
   * Writes the current simplex to the given vectors
   * @param {Vector3} pBuf 
   * @param {Vector3} qBuf 
   * @param {Vector3} yBuf 
   * @returns The number of vertices in the simplex
   */
  getSimplex(pBuf, qBuf, yBuf) {
    for (let i = 0; i < this.numVertices; i++) {
      yBuf[i] = this.simplexVectorW[i];
      pBuf[i] = this.simplexPointsP[i];
      qBuf[i] = this.simplexPointsQ[i];
    }
    return this.numVertices;
  }

  /**
   * @param {Vector3} w 
   * @returns {boolean}
   */
  inSimplex(w) {
    let found = false;
    // w is in the current (reduced) simplex
    for (let i = 0; i < this.numVertices; i++) {
      if (this.simplexVectorW[i].distanceToSquared(w) <= this.equalVertexThreshold) {
        found = true;
        break;
      }
    }

    // check in case lastW is already removed
    if (w === this.lastW) return true;
    return found;
  }

  /**
   * Writes the cached closest vector to `v`
   * @param {Vector3} v 
   */
  backupClosest(v) {
    v.copy(this.cachedV);
  }

  emptySimplex() {
    return this.numVertices === 0;
  }

  /**
   * @param {Vector3} p1 
   * @param {Vector3} p2 
   */
  computePoints(p1, p2) {
    this.updateClosestVectorAndPoints();
    p1.copy(this.cachedP1);
    p2.copy(this.cachedP2);
  }

  /**
   * @param {Vector3} p 
   * @param {Vector3} a 
   * @param {Vector3} b 
   * @param {Vector3} c 
   * @param {SubSimplexClosestResult} result
   */
  closestPtPointTriangle(p, a, b, c, result) {
    result.usedVertices.reset();

    // check if P in vertex region outside A
    const ab = Vector3.subtract(b, a);
    const ac = Vector3.subtract(c, a);
    const ap = Vector3.subtract(p, a);
    const d1 = Vector3.dot(ab, ap);
    const d2 = Vector3.dot(ac, ap);
    if (d1 <= 0 && d2 <= 0) {
      result.closestPointOnSimplex = a;
      result.usedVertices.usedVertexA = true;
      result.setBarycentricCoordinates(1, 0, 0);
      return true;
    }

    // check if P in vertex region outside B
    const bp = Vector3.subtract(p, b);
    const d3 = Vector3.dot(ab, bp);
    const d4 = Vector3.dot(ac, bp);
    if (d3 >= 0 && d4 <= d3) {
      result.closestPointOnSimplex = b;
      result.usedVertices.usedVertexB = true;
      result.setBarycentricCoordinates(0, 1, 0);
      return true;
    }

    // check if P in edge region of AB, if so return projection of P onto AB
    const vc = d1 * d4 - d3 * d2;
    if (vc <= 0 && d1 >= 0 && d3 <= 0) {
      const v = d1 / (d1 - d3);
      result.closestPointOnSimplex = Vector3.add(a, Vector3.multiply(ab, v));
      result.usedVertices.usedVertexA = true;
      result.usedVertices.usedVertexB = true;
      result.setBarycentricCoordinates(1 - v, v, 0);
      return true;
    }

    // check if P in vertex region outside C
    const cp = Vector3.subtract(p, c);
    const d5 = Vector3.dot(ab, cp);
    const d6 = Vector3.dot(ac, cp);
    if (d6 >= 0 && d5 <= d6) {
      result.closestPointOnSimplex = c;
      result.usedVertices.usedVertexC = true;
      result.setBarycentricCoordinates(0, 0, 1);
      return true;
    }

    // check if P in edge region of AC, if so return projection of P onto AC
    const vb = d5 * d2 - d1 * d6;
    if (vb <= 0 && d2 >= 0 && d6 <= 0) {
      const w = d2 / (d2 - d6);
      result.closestPointOnSimplex = Vector3.add(a, Vector3.multiply(ac, w));
      result.usedVertices.usedVertexA = true;
      result.usedVertices.usedVertexC = true;
      result.setBarycentricCoordinates(1 - w, 0, w);
      return true;
    }

    // check if P in edge region of BC, if so return project of P onto BC
    const va = d3 * d6 - d5 * d4;
    if (va <= 0 && (d4 - d3) >= 0 && (d5 - d6) >= 0) {
      const w = (d4 - d3) / ((d4 - d3) + (d5 - d6));

      const diff = Vector3.subtract(c, b)
      result.closestPointOnSimplex = Vector3.add(b, Vector3.multiply(diff, w));
      result.usedVertices.usedVertexB = true;
      result.usedVertices.usedVertexC = true;
      result.setBarycentricCoordinates(0, 1 - w, w);
      return true;
    }

    // P inside face region. Compute Q through its barycentric coordinates (u,v,w)
    const denom = 1 / (va + vb + vc);
    const v = vb * denom;
    const w = vc * denom;

    result.closestPointOnSimplex = Vector3.add(
      a, 
      Vector3.multiply(ab, v), 
      Vector3.multiply(ac, w)
    );
    result.usedVertices.usedVertexA = true;
    result.usedVertices.usedVertexB = true;
    result.usedVertices.usedVertexC = true;
    result.setBarycentricCoordinates(1 - v - w, v, w);

    return true;
  }

  /**
   * @param {Vector3} p 
   * @param {Vector3} a 
   * @param {Vector3} b 
   * @param {Vector3} c 
   * @param {Vector3} d 
   * @param {SubSimplexClosestResult} result
   * @returns {boolean} true if success, false if tetrahedron is degenerate
   */
  closestPtPointTetrahedron(p, a, b, c, d, result) {
    const tempResult = new SubSimplexClosestResult();

    tempResult.reset();
    tempResult.usedVertices.usedVertexA = true;
    tempResult.usedVertices.usedVertexB = true;
    tempResult.usedVertices.usedVertexC = true;
    tempResult.usedVertices.usedVertexD = true;

    const pointOutsideABC = this.pointOutsideOfPlane(p, a, b, c, d);
    const pointOutsideACD = this.pointOutsideOfPlane(p, a, c, d, b);
    const pointOutsideADB = this.pointOutsideOfPlane(p, a, d, b, c);
    const pointOutsideBDC = this.pointOutsideOfPlane(p, b, d, c, a);

    if (pointOutsideABC < 0 || pointOutsideACD < 0 || pointOutsideADB < 0 || pointOutsideBDC < 0) {
      result.degenerate = true;
      return false;
    }

    if (!pointOutsideABC && !pointOutsideACD && !pointOutsideADB && !pointOutsideBDC) {
      return false;
    }

    let bestSqDist = Number.POSITIVE_INFINITY;
    // If point outside face abc then compute closest point on abc
    if (pointOutsideABC) {
      this.closestPtPointTriangle(p, a, b, c, tempResult);
      const q = tempResult.closestPointOnSimplex;

      const diff = Vector3.subtract(q, p);
      const sqDist = Vector3.dot(diff, diff);
      // Update best closest point if (squared) distance is less than current best
      if (sqDist < bestSqDist) {
        bestSqDist = sqDist;
        result.closestPointOnSimplex = q;
        result.usedVertices.reset();
        result.usedVertices.usedVertexA = tempResult.usedVertices.usedVertexA;
        result.usedVertices.usedVertexB = tempResult.usedVertices.usedVertexB;
        result.usedVertices.usedVertexC = tempResult.usedVertices.usedVertexC;
        result.setBarycentricCoordinates(
          tempResult.barycentricCoords[0],
          tempResult.barycentricCoords[1],
          tempResult.barycentricCoords[2],
          0
        );
      }
    }

    // Repeat test for face acd
    if (pointOutsideACD) {
      this.closestPtPointTriangle(p, a, c, d, tempResult);
      const q = tempResult.closestPointOnSimplex;

      const diff = Vector3.subtract(q, p);
      const sqDist = Vector3.dot(diff, diff);
      // Update best closest point if (squared) distance is less than current best
      if (sqDist < bestSqDist) {
        bestSqDist = sqDist;
        result.closestPointOnSimplex = q;
        result.usedVertices.reset();
        result.usedVertices.usedVertexA = tempResult.usedVertices.usedVertexA;
        result.usedVertices.usedVertexC = tempResult.usedVertices.usedVertexB;
        result.usedVertices.usedVertexD = tempResult.usedVertices.usedVertexC;
        result.setBarycentricCoordinates(
          tempResult.barycentricCoords[0],
          0,
          tempResult.barycentricCoords[1],
          tempResult.barycentricCoords[2],
        );
      }
    }

    // Repeat test for face adb
    if (pointOutsideADB) {
      this.closestPtPointTriangle(p, a, d, b, tempResult);
      const q = tempResult.closestPointOnSimplex;

      const diff = Vector3.subtract(q, p);
      const sqDist = Vector3.dot(diff, diff);
      // Update best closest point if (squared) distance is less than current best
      if (sqDist < bestSqDist) {
        bestSqDist = sqDist;
        result.closestPointOnSimplex = q;
        result.usedVertices.reset();
        result.usedVertices.usedVertexA = tempResult.usedVertices.usedVertexA;
        result.usedVertices.usedVertexB = tempResult.usedVertices.usedVertexC;
        result.usedVertices.usedVertexD = tempResult.usedVertices.usedVertexB;
        result.setBarycentricCoordinates(
          tempResult.barycentricCoords[0],
          tempResult.barycentricCoords[2],
          0,
          tempResult.barycentricCoords[1],
        );
      }
    }

    // Repeat test for face bdc
    if (pointOutsideBDC) {
      this.closestPtPointTriangle(p, b, d, c, tempResult);
      const q = tempResult.closestPointOnSimplex;

      const diff = Vector3.subtract(q, p);
      const sqDist = Vector3.dot(diff, diff);
      // Update best closest point if (squared) distance is less than current best
      if (sqDist < bestSqDist) {
        bestSqDist = sqDist;
        result.closestPointOnSimplex = q;
        result.usedVertices.reset();
        result.usedVertices.usedVertexB = tempResult.usedVertices.usedVertexA;
        result.usedVertices.usedVertexC = tempResult.usedVertices.usedVertexC;
        result.usedVertices.usedVertexD = tempResult.usedVertices.usedVertexB;
        result.setBarycentricCoordinates(
          0,
          tempResult.barycentricCoords[0],
          tempResult.barycentricCoords[2],
          tempResult.barycentricCoords[1],
        );
      }
    }

    return true;
  }

  /**
   * @param {Vector3} p 
   * @param {Vector3} a 
   * @param {Vector3} b 
   * @param {Vector3} c 
   * @param {Vector3} d 
   * @returns {-1 | 0 | 1} 1 for point is outside, 0 for inside, -1 for degenerate
   */
  pointOutsideOfPlane(p, a, b, c, d) {
    const normal = Vector3.cross(Vector3.subtract(b, a), Vector3.subtract(c, a));

    const signp = Vector3.dot(Vector3.subtract(p, a), normal);
    const signd = Vector3.dot(Vector3.subtract(d, a), normal);

    if (signd * signd < SMALL_NUMBER * SMALL_NUMBER) return -1;

    return signp * signd < 0 ? 1 : 0;
  }
}