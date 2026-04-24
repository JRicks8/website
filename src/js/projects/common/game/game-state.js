import { Camera, Scene } from "three";
import { Vector2 } from "../math/vector2.js";

export const GameState = {
  /** @type {Scene} */
  scene: undefined,
  /** @type {Camera} */
  mainCamera: undefined,
  mousePosition: new Vector2()
};