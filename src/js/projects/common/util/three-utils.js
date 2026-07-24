import { BufferGeometry, PerspectiveCamera, Sprite, SpriteMaterial, TextureLoader, WebGLRenderer } from "three";
import { Vector3 } from "../math/vector3.js";

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
 * Generates an array of points in space from the 'position' attribute in the 
 * provided geometry
 * @param {BufferGeometry} geometry
 * @returns {Vector3[]}
 */
export function getPointsFromGeometry(geometry) {
  /** @type {Vector3[]} */
  const points = [];
  const arr = geometry.attributes.position.array;
  for (let i = 3; i <= arr.length; i += 3) {
    points.push(new Vector3(arr[i-3], arr[i-2], arr[i-1]));
  }
  return points;
}