import { Vector3 } from "../math/vector3.js";
import { RigidbodyComponent } from "./rigidbody.js";

// Excellent resource: https://graphics.pixar.com/pbm2001/pdf/notesg.pdf

export class PhysicsWorld {
  /** @type {RigidbodyComponent[]} */
  rigidbodies = [];
  gravity = new Vector3(0, 9.8, 0);

  /**
   * Move forward in the physics simulation for time t = dt
   * @param {number} dt 
   */
  step(dt) {
    this.rigidbodies.forEach(body => {
      body.addLinearForce(this.gravity);
      body.step(dt);
    });
  }
}