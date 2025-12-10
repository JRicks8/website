/** @type {(dt: number) => void} dt */
let callback = (dt) => {};
let paused = true;

let last = 0;

/** Performs a single tick cycle. */
function tick() {
  if (paused) return;

  let now = Date.now();
  const dt = (now - last) / 1000; // dt is in seconds. Convert ms -> s
  last = now;

  callback(dt);

  window.requestAnimationFrame(tick);
}

/** Manages the tick cycle and invokes the provided callback on each window animation frame */
export default {
  /** Unpauses and starts the tick cycle. */
  start() {
    paused = false;
    last = Date.now();
    window.requestAnimationFrame(tick);
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
  },

  // TODO: Manual throttle of tick duration
  /**
   * The desired amount of time in milliseconds to spend before advancing to the next tick.
   * Reducing this effectively increases framerate and makes things look a bit better at the cost of 
   * more compute required. Increasing this may improve performance.
   * Setting this to zero will make the application run as fast as possible.
   * @param {number} ms Time in milliseconds
   */
  setTickDuration(ms) {
  }
};