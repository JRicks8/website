import { Camera, Scene } from "three";
import { Vector2 } from "../math/vector2.js";

export const GameState = {
  /** @type {Scene | undefined} */
  scene: undefined,
  /** @type {Camera | undefined} */
  mainCamera: undefined,
  mousePosition: new Vector2(),
  
  paused: false,
  // Hard pause completely halts the tick cycle.
  hardPaused: false
};