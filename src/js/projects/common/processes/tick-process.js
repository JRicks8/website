/** @type {(dt: number) => void} dt */
let _callback = (dt) => {};
let _paused = true;

let _interval = 0;
let _last = 0;

/** Performs a single tick cycle. */
function tick() {

  let now = Date.now();
  const dt = (now - _last);

  if (dt >= _interval) {
    _last = now;
    _callback(dt / 1000); // dt is in ms. Convert ms -> s
  }

  if (_paused) return;
  window.requestAnimationFrame(tick);
}

/** Manages the tick cycle and invokes the provided callback on each window animation frame */
export const TickProcess = {
  /** Unpauses and starts the tick cycle. */
  start() {
    _paused = false;
    _last = Date.now();
    window.requestAnimationFrame(tick);
  },

  /** Prevents the tick cycle from continuing. */
  pause() {
    _paused = true;
  },

  /**
   * Sets the callback to be invoked on each tick cycle.
   * @param {(dt: number) => void} newCallback 
   */
  setCallback(newCallback) {
    _callback = newCallback;
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
    if (!ms && ms !== 0) return;
    if (ms < 0) ms = 0;
    _interval = ms;
  }
};