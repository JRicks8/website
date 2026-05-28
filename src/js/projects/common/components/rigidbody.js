import { Matrix3x3 } from "../math/matrix3x3.js";
import { Vector3 } from "../math/vector3.js";
import { BodyState } from "../physics/body-state.js";
import { ColliderComponent } from "./collider/collider.js";
import { Component } from "./class/component.js";

/**
 * @typedef {Object} BodyConfig
 * @property {Restraint[]} [restraints]
 * @property {boolean} [noCollide] Ignored during collision checks
 * @property {boolean} [noForces] True if no forces should act on this object (velocities can still be set)
 */

export const COMP_RIGIDBODY = 'Rigidbody';

export class RigidbodyComponent extends Component {
  /** @type {number} */
  id = -1;

  /** @type {ColliderComponent} */
  colliderComponent;
  
  state = new BodyState();

  /** @type {BodyConfig} */
  bodyConfig = {};

  iBody = new Matrix3x3();

  constructor() {
    super(COMP_RIGIDBODY);
  }
}

export const RESTRAINT_ROTATION_AXIS = 'RotationAxisRestraint';
export const RESTRAINT_POSITION_AXIS = 'PositionAxisRestraint';
export const RESTRAINT_POSITION = 'PositionRestraint';

export class Restraint {
  /** @type {?string} */
  type = null;
  components = { x: false, y: false, z: false };
  /** @type {Vector3} */
  vector = new Vector3();
}