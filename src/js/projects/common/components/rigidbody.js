import { Matrix3x3 } from "../math/matrix3x3.js";
import { BodyState } from "../physics/body-state.js";
import { ColliderComponent } from "./class/collider.js";
import { Component } from "./class/component.js";

export const COMP_RIGIDBODY = 'Rigidbody';

export class RigidbodyComponent extends Component {
  /** @type {number} */
  id = -1;

  /** @type {ColliderComponent | undefined} */
  colliderComponent;
  bodyState = new BodyState();
  iBody = new Matrix3x3();

  /** Ignored during collision checks */
  noCollide = false;
  /** True if no forces should act on this object (velocities can still be set) */
  noForces = false;

  constructor() {
    super(COMP_RIGIDBODY);
  }
}