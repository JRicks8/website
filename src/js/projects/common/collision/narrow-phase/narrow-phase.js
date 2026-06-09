import { GameState } from "../../game/game-state.js";
import { DebugProcess } from "../../processes/debug-process.js";
import { getIntersectionTest } from "../intersection-test-mapper.js";

/** @import {BodyInfo} from "../../processes/physics-process.js" */

export class NarrowPhaseSolver {
  /** @param {{ b1: BodyInfo, b2: BodyInfo }[]} pairs */
  solve(pairs) {
    const contacts = [];
    for (const {b1, b2} of pairs) {
      if (b1.colliderType && b2.colliderType) {
        const test = getIntersectionTest(b1.colliderType, b2.colliderType);
        const point = test(b1, b2);
        if (point) {
          DebugProcess.drawPoints({ points: [point] });
          GameState.paused = true;
        }
      }
    }
    return contacts;
  }
}