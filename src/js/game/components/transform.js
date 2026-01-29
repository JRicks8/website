import { Component } from "./component.js";
import { Quaternion } from "../../math/quaternion.js";
import { Vector3 } from "../../math/vector3.js";
import { Entity } from "../entity.js";

export const COMP_TRANSFORM = 'Transform';

export class Transform extends Component {
  /** @type {Transform} */
  parent;
  /** @type {Set<Transform>} */
  children = new Set();

  position = new Vector3();
  /** @type {Quaternion} */
  orientation = new Quaternion();
  size = new Vector3(1, 1);

  /**
   * @param {Entity} entity
   * @param {Transform} parent
   */
  constructor(entity, parent) {
    super(COMP_TRANSFORM);
    this.entity = entity;
    this.parent = parent;
  }

  /**
   * Sets the parent of this Transform.
   * @param {Transform} parent 
   */
  setParent(parent) {
    this.parent?.children.delete(this);
    this.parent = parent;
    this.parent.children.add(this);
  }
}