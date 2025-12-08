import { PerspectiveCamera, Scene, Sprite, SpriteMaterial, TextureLoader, WebGLRenderer } from "three";
import { GameObject } from "../game/game-object.js";

/**
 * Resizes the given three.js renderer and camera to match the given size.
 * @param {WebGLRenderer} renderer 
 * @param {PerspectiveCamera} camera 
 * @param {number} sizeX 
 * @param {number} sizeY 
 */
export function resizeRenderView(renderer, camera, sizeX, sizeY) {
  renderer.setSize(sizeX, sizeY);
  camera.aspect = sizeX / sizeY;
}

/**
 * @param {Scene} scene 
 * @param {GameObject} gameObject 
 */
export function addSpriteToScene(scene, gameObject) {

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