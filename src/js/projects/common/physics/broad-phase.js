import { Box3 } from "three";
import { RigidbodyComponent } from "../components/rigidbody.js";
import { Vector3 } from "../math/vector3.js";
import { DebugProcess } from "../processes/debug-process.js";
import { getWorldPosition } from "../util/transform-utils.js";

/**
 * Extremely simple and inefficient check, where every object 
 * compares itself with every other object O(n^2) complexity.  
 * Design note: This is in a class because in the future if I want to 
 * Come back to optimize this, I will likely need to store state locally.
 */
export class BroadPhaseSolver {
  /**
   * Returns pairs of bodies that may be colliding.
   * @param {RigidbodyComponent[]} bodies
   * @returns {{ r1: RigidbodyComponent, r2: RigidbodyComponent }[]}
   */
  solve(bodies) {
    const res = [];
    for (let i = 0; i < bodies.length - 1; i++) {
      for (let j = bodies.length - 1; j > i; j--) {
        const m1 = bodies[i].colliderComponent?.colliderMesh;
        const m2 = bodies[j].colliderComponent?.colliderMesh;
        if (m1 && m2) {
          const bb1 = new Box3().setFromObject(m1);
          const bb2 = new Box3().setFromObject(m2);
          if (bb1.intersectsBox(bb2)) {
            res.push({ r1: bodies[i], r2: bodies[j] });
          }
        }
      }
    }
    return res;
  }
}