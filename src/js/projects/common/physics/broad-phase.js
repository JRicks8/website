/** @import {BodyInfo} from "../processes/physics-process.js" */

/**
 * Extremely simple and inefficient check, where every object 
 * compares itself with every other object O(n^2) complexity.  
 * Design note: This is in a class because in the future if I want to 
 * Come back to optimize this, I will likely need to store state locally.
 */
export class BroadPhaseSolver {
  /**
   * Returns pairs of bodies that may be colliding.
   * @param {BodyInfo[]} bodies
   * @returns {{ b1: BodyInfo, b2: BodyInfo }[]}
   */
  solve(bodies) {
    const res = [];
    for (let i = 0; i < bodies.length - 1; i++) {
      for (let j = bodies.length - 1; j > i; j--) {
        const g1 = bodies[i].geometry;
        const g2 = bodies[j].geometry;
        if (g1 && g2) {
          g1.computeBoundingBox();
          g2.computeBoundingBox();
          if (g1.boundingBox.intersectsBox(g2.boundingBox)) {
            res.push({ b1: bodies[i], b2: bodies[j] });
          }
        }
      }
    }
    return res;
  }
}