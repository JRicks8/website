import { Component } from "./components/component.js";

export class Entity {
  active = true;
  /** @type {Set<Component>} */
  components = new Set();
  /** @type {Set<Entity>} */
  children = new Set();
  destroyed = false;

  constructor() {}

  /**
   * Adds the specified component to this GameObject.
   * @template T
   * @param {T & Component} component
   * @returns {T & Component} Returns the added component
   */
  addComponent(component) {
    this.components.add(component);
    component.entity = this;
    return component;
  }

  /**
   * Gets the first component with the given component name.
   * @param {string} componentName 
   * @returns {any} The matching component, or undefined if there is no matching component.
   */
  getComponent(componentName) {
    return [...this.components.values()].find(c => c.name === componentName);
  }

  /**
   * Gets all components with the given component type.
   * @param {string} componentType 
   * @returns {Component[]} All matching components.
   */
  getComponents(componentType) {
    return [...this.components.values()].filter(c => c.name === componentType);
  }

  /**
   * Removes the specified component from this GameObject.
   * @param {Component} component
   * @returns {boolean} Whether the component was successfully removed or not.
   */
  removeComponent(component) {
    const success = this.components.delete(component);
    if (success) {
      component.entity = null;
    }
    return success;
  }

  /**
   * Removes the first component of the specified name from this GameObject.
   * @param {string} componentName 
   * @returns {Component | undefined} The removed component, or undefined if no components with a matching 
   * component type exist on this GameObject.
   */
  removeComponentWithName(componentName) {
    const c = [...this.components.values()].find(c => c.name === componentName);
    if (this.removeComponent(c)) {
      return c;
    }
  }

  removeAllComponents() {
    for (const c of this.components) {
      this.removeComponent(c);
    }
    this.components.clear();
  }

  cleanup() {
    this.destroyed = true;
    this.removeAllComponents();
  }
}