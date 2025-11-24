import { GameObject } from "../game/game-object.js";
import { Vector2 } from "../math/vector2.js";
import { CircleCollider } from "../physics/circle-collider.js";
import { RigidbodyComponent } from "../physics/rigidbody.js";
import { loadImageGroup } from "../util/image-loader.js";

/**
 * @typedef {Object} Frame
 * @property {HTMLImageElement} image
 * @property {number} hold
 */

/** 
 * @typedef {Object} Animation
 * @property {string} name
 * @property {boolean} loop
 * @property {Animation} [nextAnim]
 * @property {Frame[]} frames
 */

/** @type {Map<string, Animation>} */
const animations = new Map();

const images = loadImageGroup('assets/bird/idle/', 'bird_idle', 1);

animations.set('idle', {
  name: 'idle',
  loop: true,
  frames: [
    {
      image: images[0],
      hold: 1000
    }
  ],
});

export class Bird extends GameObject {
  rigidbodyComponent = this.addComponent(new RigidbodyComponent());

  drawSize = new Vector2(64, 64);
  drawColliders = true;

  frameIndex = 0;
  animation = animations.get('idle');
  holdForFrames = this.animation.frames[this.frameIndex].hold;

  constructor() {
    super();
    const coll = new CircleCollider();
    coll.radius = 30;
    this.rigidbodyComponent.collider = coll;
  }

  /**
   * Performs logic calculations that are done on every frame.
   * @param {number} dt - Delta Time (The time elapsed since the last frame in ms)
   */
  update(dt) {
    this.position.x = this.rigidbodyComponent.position.x;
    this.position.y = this.rigidbodyComponent.position.y;
  }

  /**
   * Draws this bird in the specified context.
   * @param {CanvasRenderingContext2D} ctx 
   */
  draw(ctx) {
    if (!this.animation) return;

    if (this.holdForFrames <= 0) {
      this.frameIndex++;
      if (this.frameIndex >= this.animation.frames.length) {
        this.frameIndex = 0;
        if (!this.animation.loop) {
          this.animation = this.animation.nextAnim;
        }
      }
      this.holdForFrames = this.animation?.frames[this.frameIndex].hold;
    } else {
      this.holdForFrames--;
    }

    const img = this.animation?.frames[this.frameIndex].image;
    if (img) {
      const drawPosition = Vector2.subtract(this.position, Vector2.divide(this.drawSize, 2));
      ctx.drawImage(img, drawPosition.x, drawPosition.y, this.drawSize.x, this.drawSize.y);
    }

    if (this.drawColliders) {
      this.rigidbodyComponent.collider.draw(ctx);
    }
  }

  /**
   * Sets the animation to the given animation name.
   * @param {string} name 
   */
  setAnimation(name) {
    this.animation = animations.get(name);
  }
}