import { Collider } from "./collider.js";

export class CircleCollider extends Collider {
  size = { r: 50 };

  get rect() {
    return { 
      x0: this.position.x, 
      y0: this.position.y,
      x1: this.position.x + 2 * this.size.r,
      y1: this.position.y + 2 * this.size.r
    };
  }

  constructor() {
    super('Circle');
  }
}