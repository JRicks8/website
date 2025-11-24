/** @type {(dt: number) => void} dt */
let callback = (dt) => {};
let paused = true;

let last = 0;
/** Performs a single tick cycle. */
function step() {
  if (paused) return;
  const now = Date.now();
  const dt = (now - last) / 1000;
  last = now;

  callback(dt);

  window.requestAnimationFrame(step);
}

/** Manages the tick cycle and invokes the provided callback on each window animation frame */
export default {
  /** Unpauses and starts the tick cycle. */
  start() {
    paused = false;
    last = Date.now();
    window.requestAnimationFrame(step);
  },

  /** Prevents the tick cycle from continuing. */
  pause() {
    paused = true;
  },

  /**
   * Sets the callback to be invoked on each tick cycle.
   * @param {(dt: number) => void} newCallback 
   */
  setCallback(newCallback) {
    callback = newCallback;
  }
};