import { Entity } from "../entity.js";

export class Component {
  /** @type {Entity} */
  entity;
  /** @type {string} */
  name;

  /** @param {string} name */
  constructor(name) {
    this.name = name;
  }
}