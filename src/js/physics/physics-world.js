import { Vector3 } from "../math/vector3.js";
import { RigidbodyComponent } from "../game/components/rigidbody.js";
import { Quaternion as ThreeQuaternion } from "three";
import physicsProcess from "../game/processes/physics-process.js";
import { COMP_TRANSFORM, Transform } from "../game/components/transform.js";

// Excellent resource: https://graphics.pixar.com/pbm2001/pdf/notesg.pdf

export class PhysicsWorld {
  /** @private @type {RigidbodyComponent[]} */
  _bodies = [];
  gravity = new Vector3(0, -0.01, 0);

  /**
   * @param {RigidbodyComponent} body 
   */
  addBody(body) {
    this._bodies.push(body);
  }

  /**
   * @param  {...RigidbodyComponent} bodies 
   */
  addBodies(...bodies) {
    for (const b of bodies) {
      this.addBody(b);
    }
  }

  /**
   * @param {RigidbodyComponent} body 
   * @returns {RigidbodyComponent | undefined} The removed rigidbody component or undefined
   */
  removeBody(body) {
    const i = this._bodies.findIndex(b => b.id === body.id);
    if (i >= 0) {
      return this._bodies.splice(i, 1).at(0);
    }
  }

  /**
   * Move forward in the physics simulation by dt seconds
   * @param {number} dt 
   */
  step(dt) {
    this._bodies.forEach(body => {
      /** @type {Transform} */
      const t = body.entity.getComponent(COMP_TRANSFORM);
      body.bodyState.position.setv3(t.position);
      body.bodyState.orientation.setv4(t.orientation)
    });

    physicsProcess.step(dt, this._bodies);
  }

  /**
   * Updates the position of each component's entity and the collider meshes
   */
  update() {
    for (const body of this._bodies) {
      /** @type {Transform} */
      const t = body.entity.getComponent(COMP_TRANSFORM);
      if (!t) continue;
      
      t.position.set(body.bodyState.position.x, body.bodyState.position.y, body.bodyState.position.z);
      t.orientation.set(body.bodyState.orientation.w, body.bodyState.orientation.x, body.bodyState.orientation.y, body.bodyState.orientation.z);
      
      body.collider.mesh.position.set(body.bodyState.position.x, body.bodyState.position.y, body.bodyState.position.z);
      body.collider.mesh.setRotationFromQuaternion(new ThreeQuaternion(body.bodyState.orientation.x, body.bodyState.orientation.y, body.bodyState.orientation.z, body.bodyState.orientation.w));
    }
  }
}