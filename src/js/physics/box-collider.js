import { Collider } from "./collider.js";

export class BoxCollider extends Collider {
  size = { w: 100, h: 100 };

  get rect() {
    return { 
      x0: this.position.x, 
      y0: this.position.y,
      x1: this.position.x + this.size.w,
      y1: this.position.y + this.size.h
    };
  }

  constructor() {
    super('Box');
  }
}