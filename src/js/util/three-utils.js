import { PerspectiveCamera, Sprite, SpriteMaterial, TextureLoader, WebGLRenderer } from "three";
import { Vector2 } from "../math/vector2.js";

/**
 * Resizes the given three.js renderer and camera to match the given size.
 * @param {WebGLRenderer} renderer 
 * @param {PerspectiveCamera} camera 
 * @param {number} sizeX 
 * @param {number} sizeY 
 */
export function resizeRenderView(renderer, camera, sizeX, sizeY) {
  camera.aspect = sizeX / sizeY;
  camera.updateProjectionMatrix();
  renderer.setSize(sizeX, sizeY);
}

/**
 * @param {string} image 
 * @returns {Sprite}
 */
export function createSpriteFromImage(image) {
  const map = new TextureLoader().load(image);
  const material = new SpriteMaterial({ map: map });
  return new Sprite(material);
}

/**
 * @param {number} mouseX 
 * @param {number} mouseY 
 * @returns The pixel coords in the format Vector2([-1, 1], [-1, 1]) 
 */
export function getMouseCoordsFromPixel(mouseX, mouseY) {
  return new Vector2((mouseX / window.innerWidth) * 2 - 1, -(mouseY / window.innerHeight) * 2 + 1);
}