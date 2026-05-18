import { Contact } from "../collision/contact.js";
import { ColliderComponent, COMP_COLLIDER } from "../components/collider/collider.js";
import { COMP_RIGIDBODY, RigidbodyComponent } from "../components/rigidbody.js";
import { ComponentManager } from "../game/component-manager.js";
import { GameState } from "../game/game-state.js";
import { DebugProcess } from "../processes/debug-process.js";
import { getIntersectionTest } from "./intersection-test-mapper.js";

export class NarrowPhaseSolver {
  /** @param {{ r1: RigidbodyComponent, r2: RigidbodyComponent }[]} pairs */
  solve(pairs) {
    const contacts = [];
    for (const {r1, r2} of pairs) {
      if (r1.colliderComponent.colliderType && r2.colliderComponent.colliderType) {
        const test = getIntersectionTest(r1.colliderComponent.colliderType, r2.colliderComponent.colliderType);
        const point = test(r1.colliderComponent, r2.colliderComponent);
        if (point) {
          DebugProcess.drawPoints({ points: [point] });
          GameState.paused = true;
        }
      }
    }
    return contacts;
  }
}