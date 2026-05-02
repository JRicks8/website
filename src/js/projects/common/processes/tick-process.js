import { GameState } from "../game/game-state.js";

/** @type {(dt: number) => void} dt */
let _callback = (dt) => {};

let _interval = 16;
let _last = 0;

/** 
 * Performs a looping tick cycle, unless the game state is hard-paused or single == true. 
 * @param {DOMHighResTimeStamp} [snapshot]
 * @param {boolean} [single]
 */
function tick(snapshot, single = false) {
  let now = performance.now();

  let dt = now - _last;
  let adjInterval = _interval;

  if (dt >= adjInterval) {
    _last = now;
    _callback(dt / 1000); // dt is in ms. Convert ms -> s
  }

  if (GameState.hardPaused || single) return;
  window.requestAnimationFrame(tick);
}

/** Manages the tick cycle and invokes the provided callback on each window animation frame */
export const TickProcess = {
  /** Unpauses and starts the tick cycle. */
  start() {
    _last = performance.now();
    window.requestAnimationFrame(tick);
  },

  /** @param {number} dt */
  singleStep(dt) {
    _last = performance.now() - dt;
    tick(undefined, true);
  },

  /**
   * Sets the callback to be invoked on each tick cycle.
   * @param {(dt: number) => void} newCallback 
   */
  setCallback(newCallback) {
    _callback = newCallback;
  },

  /**
   * The desired amount of time in milliseconds to spend before advancing to the next tick.
   * Reducing this effectively increases framerate and makes things look a bit better at the cost of 
   * more compute required. Increasing this may improve performance.
   * Setting this to one will make the application run as fast as possible.
   * @param {number} ms Time in milliseconds (minimum of 1)
   */
  setTickDuration(ms) {
    if (!ms && ms !== 0) return;
    if (ms < 0) ms = 0;
    _interval = ms;
  }
};