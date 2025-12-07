import { PerspectiveCamera, WebGLRenderer } from "three";

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