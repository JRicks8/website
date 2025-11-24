import { Matrix3x3 } from "../math/matrix3x3.js";
import { Vector2 } from "../math/vector2.js";
import { Vector3 } from "../math/vector3.js";
import { Collider } from "./collider.js";

export class CircleCollider extends Collider {
  radius = 50;

  get rect() {
    return { 
      x0: this.offset.x + this.rigidbody.position.x, 
      y0: this.offset.y + this.rigidbody.position.y,
      x1: this.offset.x + 2 * this.radius + this.rigidbody.position.x,
      y1: this.offset.y + 2 * this.radius + this.rigidbody.position.y
    };
  }

  constructor() {
    super('Circle');
  }

  /** 
   * Draws this collider to the screen.
   * @override
   * @param {CanvasRenderingContext2D} ctx - The target drawing context
   * @param {string} [color] - The color of the collider.
   */
  draw(ctx, color = 'green') {
    if (!this.rigidbody) return;
    ctx.beginPath();

    ctx.lineWidth = 1;
    ctx.strokeStyle = color;

    const circleMiddle = Vector2.add(this.rigidbody.position, this.offset);
    ctx.arc(circleMiddle.x, circleMiddle.y, this.radius, 0, 2 * Math.PI);

    ctx.moveTo(circleMiddle.x, circleMiddle.y);
    const dir = Vector2.fromAngle(Matrix3x3.toEulerAngles(this.rigidbody.orientation).z);
    dir.multiply(this.radius);
    dir.x += this.rigidbody.position.x;
    dir.y += this.rigidbody.position.y;
    ctx.lineTo(dir.x, dir.y);

    ctx.stroke();
  }
}