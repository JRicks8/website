var callback = () => {};
let paused = true;

let last = 0;
function step(now) {
  if (paused) return;
  const dt = now - last;
  last = now;

  callback(dt);

  window.requestAnimationFrame(step);
}

/** Manages the tick cycle and invokes the provided callback on each window animation frame */
export default {
  start() {
    paused = false;
    window.requestAnimationFrame(step);
  },
  pause() {
    paused = true;
  },
  setCallback(newCallback) {
    callback = newCallback;
  }
}