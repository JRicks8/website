import { Vector2 } from "../math/vector2.js";

/**
 * @param {number} mouseX 
 * @param {number} mouseY 
 * @returns The pixel coords in the format Vector2([-1, 1], [-1, 1]) 
 */
export function getMouseCoordsFromPixel(mouseX, mouseY) {
  return new Vector2((mouseX / window.innerWidth) * 2 - 1, -(mouseY / window.innerHeight) * 2 + 1);
}