import { Vector2 } from "../math/vector.js";
import { Component } from "./component.js";

export class GameObject {
  position = new Vector2();

  /** @type {number} */
  rotation = 0;

  size = new Vector2(1, 1);

  /** @type {Component[]} */
  components = [];

  /** @type {GameObject[]} */
  children = [];

  constructor() {}

  /**
   * Adds the specified component to this GameObject.
   * @param {Component} component
   * @returns {Component} - Returns the added component
   */
  addComponent(component) {
    this.components.push(component);
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
   * @returns {Component | undefined} The removed component, or undefined if the component does not exist 
   * on this GameObject.
   */
  removeComponent(component) {
    const i = this.components.findIndex(c => c === component);
    if (i >= 0) {
      return this.components.splice(i, 1).at(0);
    }
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
      return this.components.splice(i, 1).at(0);
    }
  }
}