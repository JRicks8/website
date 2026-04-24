import { Component } from "../components/class/component.js";
import { TransformComponent } from "../components/transform.js";
import { ComponentManager } from "../game/component-manager.js";

export class Entity {
  /** @type {number} */
  id;

  /** 
   * The transform is needed very often, and is always present on an entity that 
   * needs it, so a reference to it is kept here.
   * @type {TransformComponent}
   */
  transform;
  
  /** @type {{[type: string]: Component[]}} */
  components;

  /** @param {number} id */
  constructor(id) {
    this.id = id;
    this.components = {};
    this.transform = ComponentManager.addComponent(this, new TransformComponent());
  }
}