import { BufferGeometry, Mesh } from "three";
import { Vector3 } from "../../math/vector3.js";
import { Component } from "./component.js";

export const COMP_COLLIDER = 'Collider';

/** Generic class for collider components. */
export class ColliderComponent extends Component {
  /** @type {?string} */
  colliderType = null;
  /** @type {Vector3} */
  offset = new Vector3();
  
  /** @type {?BufferGeometry} */
  geometry = null;
  /** @type {?Mesh} */
  colliderMesh = null;

  constructor() {
    super(COMP_COLLIDER);
  }
}