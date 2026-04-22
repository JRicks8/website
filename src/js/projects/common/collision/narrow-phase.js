import { Contact } from "../collision/contact.js";
import { COMP_COLLIDER } from "../components/class/collider.js";
import { RigidbodyComponent } from "../components/rigidbody.js";
import { ComponentManager } from "../game/component-manager.js";
import { DebugProcess } from "../processes/debug-process.js";
import { sphereIntersectsSphere } from "./intersection-tests.js";

export class NarrowPhaseSolver {
  /**
   * @param {{ r1: RigidbodyComponent, r2: RigidbodyComponent }[]} pairs 
   * @returns {Contact[]}
   */
  solve(pairs) {
    /** @type {Contact[]} */
    const contacts = [];
    for (const {r1, r2} of pairs) {
      const point = sphereIntersectsSphere(ComponentManager.getComponent(r1.entity, COMP_COLLIDER), ComponentManager.getComponent(r2.entity, COMP_COLLIDER));
      if (point) {
        DebugProcess.drawPoint({ position: point });
      }
    }
    return contacts;
  }
}