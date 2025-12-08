import { GameObject } from "../game/game-object.js";
import { Vector2 } from "../math/vector2.js";
import { CircleCollider } from "../physics/circle-collider.js";
import { RigidbodyComponent } from "../physics/rigidbody.js";
import { Scene } from "three";
import { createSpriteFromImage } from "../util/three-utils.js";

import bird_idle from "../../assets/bird/idle/bird_idle_0.png";

/**
 * @typedef {Object} Frame
 * @property {Vector2} offset
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

animations.set('idle', {
  name: 'idle',
  loop: true,
  frames: [
    {
      offset: new Vector2(),
      hold: 1000
    }
  ],
});

export class Bird extends GameObject {
  rigidbodyComponent = this.addComponent(new RigidbodyComponent());

  sprite = createSpriteFromImage(bird_idle);
  spriteOffset = new Vector2(0, 0);

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

    this.sprite.position.set(this.position.x, this.position.y, 0);
  }

  /**
   * Draws this bird in the specified context.
   * @param {CanvasRenderingContext2D} ctx 
   */
  // draw(ctx) {
  //   if (this.holdForFrames <= 0) {
  //     this.frameIndex++;
  //     if (this.frameIndex >= this.animation.frames.length) {
  //       this.frameIndex = 0;
  //       if (!this.animation.loop) {
  //         this.animation = this.animation.nextAnim;
  //       }
  //     }
  //     this.holdForFrames = this.animation?.frames[this.frameIndex].hold;
  //   } else {
  //     this.holdForFrames--;
  //   }
  // }

  /**
   * Adds this bird's sprite to the three.js scene
   * @param {Scene} scene 
   */
  addToScene(scene) {
    scene.add(this.sprite);
  }
}