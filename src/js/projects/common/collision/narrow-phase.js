import { Contact } from "../collision/contact.js";
import { COMP_COLLIDER } from "../components/class/collider.js";
import { RigidbodyComponent } from "../components/rigidbody.js";
import { ComponentManager } from "../game/component-manager.js";
import { sphereSeparatesSphere } from "./intersection-tests.js";

export class NarrowPhaseSolver {
  /**
   * @param {{ r1: RigidbodyComponent, r2: RigidbodyComponent }[]} pairs 
   * @returns {Contact[]}
   */
  solve(pairs) {
    /** @type {Contact[]} */
    const contacts = [];
    for (const {r1, r2} of pairs) {
      if (!sphereSeparatesSphere(
        ComponentManager.getComponent(r1.entity, COMP_COLLIDER), 
        ComponentManager.getComponent(r2.entity, COMP_COLLIDER))
      ) {
        console.log('colliding!');
      }
    }
    return contacts;
  }
}