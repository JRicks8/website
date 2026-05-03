import { Contact } from "../collision/contact.js";
import { ColliderComponent, COMP_COLLIDER } from "../components/collider/collider.js";
import { RigidbodyComponent } from "../components/rigidbody.js";
import { ComponentManager } from "../game/component-manager.js";
import { GameState } from "../game/game-state.js";
import { DebugProcess } from "../processes/debug-process.js";
import { getIntersectionTest } from "./intersection-test-mapper.js";

export class NarrowPhaseSolver {
  /**
   * @param {{ r1: RigidbodyComponent, r2: RigidbodyComponent }[]} pairs 
   * @returns {Contact[]}
   */
  solve(pairs) {
    /** @type {Contact[]} */
    const contacts = [];
    for (const {r1, r2} of pairs) {
      /** @type {ColliderComponent} */
      const c1 = ComponentManager.getComponent(r1.entity, COMP_COLLIDER);
      /** @type {ColliderComponent} */
      const c2 = ComponentManager.getComponent(r2.entity, COMP_COLLIDER);

      if (c1.colliderType && c2.colliderType) {
        const test = getIntersectionTest(c1.colliderType, c2.colliderType);
        const point = test(c1, c2);
        if (point) {
          DebugProcess.drawPoints({ points: [point] });
          GameState.paused = true;
        }
      }
    }
    return contacts;
  }
}