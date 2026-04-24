import { Entity } from "../../class/entity.js";

/** Base class for Components. Meant to be extended. */
export class Component {
  /** @type {?Entity} */
  entity = null;
  /** @type {string} */
  type;

  /** 
   * @param {string} type 
   */
  constructor(type) {
    this.type = type;
  }
}