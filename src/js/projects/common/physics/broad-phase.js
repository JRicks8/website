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
   * @returns {{ first: RigidbodyComponent, second: RigidbodyComponent }[]}
   */
  solve(bodies) {
    for (const body of bodies) {
      // @ts-expect-error
      body.colliderComponent.colliderMesh.geometry.computeBoundingBox();
    }

    const res = [];
    for (let i = 0; i < bodies.length - 1; i++) {
      for (let j = bodies.length - 1; j > i; j--) {
        // @ts-expect-error
        if (bodies[i].colliderComponent.colliderMesh.geometry.boundingBox.intersectsBox(bodies[j].colliderComponent.colliderMesh.geometry.boundingBox)) {
          res.push({ first: bodies[i], second: bodies[j] });
        }
      }
    }
    return res;
  }
}