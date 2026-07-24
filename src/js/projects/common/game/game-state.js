import { Camera, Scene } from "three";
import { Vector2 } from "../math/vector2.js";

const hardPausedElement = document.getElementById('hardPaused');
const pausedElement = document.getElementById('paused');

export const GameState = {
  /** @type {Scene | undefined} */
  scene: undefined,
  /** @type {Camera | undefined} */
  mainCamera: undefined,
  mousePosition: new Vector2(),

  dt: 0, // dt can be updated mid-tick so keep it here (pausing/unpausing)

  // Paused affects the value of delta time such that it is always zero.
  paused: false,
  // Hard pause completely halts the tick cycle.
  hardPaused: false,
  
  /** @param {boolean} pause */
  setPaused: (pause) => {
    GameState.paused = pause;
    GameState.dt = 0;

    const isHidden = pausedElement.classList.contains('hidden');
    if (pause && isHidden) {
      pausedElement.classList.remove('hidden');
    } else if (!pause && !isHidden) {
      pausedElement.classList.add('hidden');
    }
  },

  /** @param {boolean} hardPause */
  setHardPaused: (hardPause) => {
    GameState.hardPaused = hardPause;

    const isHidden = hardPausedElement.classList.contains('hidden');
    if (hardPause && isHidden) {
      hardPausedElement.classList.remove('hidden');
    } else if (!hardPause && !isHidden) {
      hardPausedElement.classList.add('hidden');
    }
  }
};