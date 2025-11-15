/** @constant @default */
export const COMP_COLLIDER = 'Collider2D';
/** @constant @default */
export const COMP_RIGIDBODY = 'Rigidbody2D';

/** @abstract */
export class Component {
  componentType;

  /** @param {string} componentType */
  constructor(componentType) {
    this.componentType = componentType;
  }
}