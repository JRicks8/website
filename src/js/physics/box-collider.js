import { Collider } from "./collider.js";

export class BoxCollider extends Collider {
  width = 100;
  height = 100;

  get rect() {
    return { 
      x0: this.offset.x, 
      y0: this.offset.y,
      x1: this.offset.x + this.width,
      y1: this.offset.y + this.height
    };
  }

  constructor() {
    super('Box');
  }
}