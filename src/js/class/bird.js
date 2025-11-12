import { CircleCollider } from "../physics/circle-collider.js";
import { loadImageGroup } from "../util/image-loader.js";

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

export class Bird {
  circleCollider = new CircleCollider();

  position = { x: 0, y: 0 };
  drawSize = { x: 64, y: 64 };

  frameIndex = 0;
  animation = animations.get('idle');
  holdForFrames = this.animation.frames[this.frameIndex].hold;

  constructor() {
    this.circleCollider.size.r = 30;
  }

  /**
   * Performs logic calculations that are done on every frame.
   * @param {number} dt - Delta Time (The time elapsed since the last frame in ms)
   */
  update(dt) {
    this.position.x = this.circleCollider.position.x;
    this.position.y = this.circleCollider.position.y;
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
      ctx.drawImage(img, this.position.x, this.position.y, this.drawSize.x, this.drawSize.y);
    }
  }

  setAnimation(name) {
    this.animation = animations.get(name);
  }
}