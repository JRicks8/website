import { Vector2 } from "../math/vector2.js";
import { RigidbodyComponent } from "./rigidbody.js";

/** @constant @default */
export const COMP_COLLIDER = 'Collider2D';

export class Collider {
  /** @type {RigidbodyComponent} */
  rigidbody;
  colliderType;
  offset = new Vector2();

  get rect() {
    console.warn('getter: "rect" should be overridden.');
    return { x0: 0, y0: 0, x1: 0, y1: 0 };
  };

  /** @param {string} colliderType */
  constructor(colliderType) {
    this.colliderType = colliderType;
  }

  /**
   * Determines whether two colliders are overlapping using an AABB test. This does not
   * necessarily mean that they are colliding. See: https://learnopengl.com/In-Practice/2D-Game/Collisions/Collision-detection
   * @param {Collider} other - The other collider to test against.
   * @returns {boolean} Whether the two colliders could be colliding.
   */
  overlapping(other) {
    const r0 = this.rect;
    const r1 = other.rect;
    return r0.x1 >= r1.x0 && r1.x1 >= r0.x0 && r0.x1 >= r1.y0 && r1.y1 >= r0.y0;
  }

  /** 
   * Draws this collider to the screen.
   * @abstract
   * @param {CanvasRenderingContext2D} ctx - The target drawing context
   * @param {string} [color] - The color of the collider.
   */
  draw(ctx, color = 'green') {}
}