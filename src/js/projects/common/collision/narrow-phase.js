import { BufferGeometry } from "three";
import { Contact } from "../collision/contact.js";
import { Vector3 } from "../math/vector3.js";
import { RigidbodyComponent } from "../components/rigidbody.js";

export class NarrowPhaseSolver {
  /**
   * @param {{ first: RigidbodyComponent, second: RigidbodyComponent }[]} maybeCollidingPairs 
   * @returns {Contact[]}
   */
  solve(maybeCollidingPairs) {
    // TODO
    return [];
  }

  /**
   * @param {BufferGeometry} b1 
   * @param {BufferGeometry} b2 
   */
  findMinimumDistance(b1, b2) {
    let separation = -1_000_000; // Some super big negative number that doesn't interfere with our search
    const positionBufferA = b1.getAttribute('position');
    const normalBufferA = b1.getAttribute('normal');
    const positionBufferB = b2.getAttribute('position');

    for (let i = 0; i < positionBufferA.count; i++) {
      const posA = new Vector3(positionBufferA.getX(i), positionBufferA.getY(i), positionBufferA.getZ(i));
      const normal = new Vector3(normalBufferA.getX(i), normalBufferA.getY(i), normalBufferA.getZ(i));
      let minSep = 1_000_000; // Again, big number to not interfere

      for (let j = 0; j < positionBufferB.count; j++) {
        const posB = new Vector3(positionBufferB.getX(i), positionBufferB.getY(i), positionBufferB.getZ(i));
        minSep = Math.min(minSep, Vector3.dot(Vector3.subtract(posB, posA), normal));
      }

      separation = Math.max(separation, minSep);
    }
    return separation;
  }

  /**
   * Finds the plane that separates all of the vertices between two bodies.
   */
  findSeparatingPlane() {

  }
}