import { RigidbodyComponent } from "../components/rigidbody.js";

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
    for (const body of bodies) {
      body.colliderComponent?.colliderMesh?.geometry.computeBoundingBox();
    }

    const res = [];
    for (let i = 0; i < bodies.length - 1; i++) {
      for (let j = bodies.length - 1; j > i; j--) {
        const b1 = bodies[i].colliderComponent?.colliderMesh?.geometry.boundingBox;
        const b2 = bodies[j].colliderComponent?.colliderMesh?.geometry.boundingBox;
        if (b1 && b2 && b1.intersectsBox(b2)) {
          res.push({ r1: bodies[i], r2: bodies[j] });
        }
      }
    }
    return res;
  }
}