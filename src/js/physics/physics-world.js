import { Vector3 } from "../math/vector3.js";
import { BroadPhaseSolver } from "./broad-phase.js";
import { NarrowPhaseSolver } from "./narrow-phase.js";
import { RigidbodyComponent } from "./rigidbody.js";

// Excellent resource: https://graphics.pixar.com/pbm2001/pdf/notesg.pdf

export class PhysicsWorld {
  /** @type {RigidbodyComponent[]} */
  rigidbodies = [];
  gravity = new Vector3(0, -0.01, 0);

  broadPhaseSolver = new BroadPhaseSolver();
  narrowPhaseSolver = new NarrowPhaseSolver();

  /**
   * Move forward in the physics simulation for time t = dt
   * @param {number} dt 
   */
  step(dt) {
    this.rigidbodies.forEach(body => {
      body.addLinearForce(this.gravity);
      body.step(dt);
    });

    const maybeColliding = this.broadPhaseSolver.solve(this.rigidbodies);
    if (maybeColliding.length > 0) {
      console.log(maybeColliding);
    }
    const contacts = this.narrowPhaseSolver.solve(maybeColliding);
  }
}