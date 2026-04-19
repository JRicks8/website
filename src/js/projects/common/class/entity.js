import { Component } from "../components/component.js";

export class Entity {
  /** @type {number} */
  id;
  /** @type {{[type: string]: Component[]}} */
  components;

  /**
   * @param {number} id 
   */
  constructor(id) {
    this.id = id;
    this.components = {};
  }
}