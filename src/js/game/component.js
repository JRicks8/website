import { GameObject } from "./game-object.js";

/** 
 * @abstract
 **/
export class Component {
  /** @type {GameObject} */
  gameObject;
  componentType;

  /** @param {string} componentType */
  constructor(componentType) {
    this.componentType = componentType;
  }
}