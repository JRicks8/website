import { Vector3 } from "../math/vector3.js";
import { Component } from "./component.js";

export class GameObject {
  /** @type {GameObject} */
  parent;
  position = new Vector3();
  /** @type {number} */
  orientation = 0;
  size = new Vector3(1, 1);
  /** @type {Component[]} */
  components = [];
  /** @type {Set<GameObject>} */
  children = new Set();

  constructor() {}

  /**
   * Sets the parent of this GameObject.
   * @param {GameObject} parent 
   */
  setParent(parent) {
    this.parent = parent;
    this.parent.children.add(this);
  }

  /**
   * Adds the specified component to this GameObject.
   * @template T
   * @param {T & Component} component
   * @returns {T & Component} Returns the added component
   */
  addComponent(component) {
    this.components.push(component);
    component.gameObject = this;
    return component;
  }

  /**
   * Gets the first component with the given component type.
   * @param {string} componentType 
   * @returns {Component | undefined} The matching component, or undefined if there is no matching component.
   */
  getComponent(componentType) {
    return this.components.find(c => c.componentType === componentType);
  }

  /**
   * Gets all components with the given component type.
   * @param {string} componentType 
   * @returns {Component[]} All matching components.
   */
  getComponents(componentType) {
    return this.components.filter(c => c.componentType === componentType);
  }

  /**
   * Removes the specified component from this GameObject.
   * @param {Component} component
   * @returns {boolean} Whether the component was successfully removed or not.
   */
  removeComponent(component) {
    const i = this.components.findIndex(c => c === component);
    if (i >= 0) {
      component.gameObject = undefined;
      this.components.splice(i, 1).at(0);
      return true;
    }
    return false;
  }

  /**
   * Removes the first component of the specified type from this GameObject.
   * @param {string} componentType 
   * @returns {Component | undefined} The removed component, or undefined if no components with a matching 
   * component type exist on this GameObject.
   */
  removeComponentOfType(componentType) {
    const i = this.components.findIndex(c => c.componentType === componentType);
    if (i >= 0) {
      const component = this.components.splice(i, 1).at(0);
      component.gameObject = undefined;
      return component;
    }
  }
}