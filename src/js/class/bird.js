import { loadImageGroup } from "./image-loader.js";

const animations = new Map();

const images = loadImageGroup('assets/bird/idle/', 'bird_idle', 1);

animations.set('idle', {
  name: 'idle',
  loop: true,
  frames: [
    {
      image: images[0],
      hold: 10
    }
  ],
});

export class Bird {
  position = { x: 0, y: 0 };
  size = { x: 64, y: 64 };

  frameIndex = 0;
  animation = animations.get('idle');
  holdForFrames = this.animation.frames[this.frameIndex].hold;

  /**
   * Performs logic calculations that are done on every frame.
   * @param {number} dt - Delta Time (The time elapsed since the last frame in ms)
   */
  update(dt) {

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
      ctx.drawImage(img, this.position.x, this.position.y, this.size.x, this.size.y);
    }
  }

  setAnimation(name) {
    this.animation = animations.get(name);
  }
}