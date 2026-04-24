import { Quaternion } from "../math/quaternion.js";
import { Vector3 } from "../math/vector3.js";
import { Component } from "./class/component.js";

export const COMP_TRANSFORM = 'Transform';

export class TransformComponent extends Component {
  /** @type {TransformComponent | null} */
  parent = null;
  /** @type {Set<TransformComponent>} */
  children = new Set();

  position = new Vector3();
  orientation = new Quaternion();
  size = new Vector3(1, 1);

  constructor() {
    super(COMP_TRANSFORM);
  }
}