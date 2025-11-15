import { COMP_COLLIDER, Component } from "../game/component.js";
import { Vector2 } from "../math/vector.js";

/** @abstract */
export class Collider extends Component {
  colliderType;
  position = new Vector2(0, 0);
  size = {};

  get rect() {
    console.warn('getter: "rect" should be overridden.');
    return { x0: 0, y0: 0, x1: 0, y1: 0 };
  };

  /** @param {string} colliderType */
  constructor(colliderType) {
    super(COMP_COLLIDER);
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