import { EventDispatcher } from "./event-dispatcher.js";

let _attached = false;

/**
 * The input listener has a preset list of common input events and hooks those events 
 * up with the event dispatcher for application-wide access.
 */
export const InputListener = {
  /**
   * Attaches a preset list of events and listeners to the window, linking
   * the callbacks to the event dispatcher. This function should only be 
   * called once.
   */
  attachListeners: () => {
    if (_attached) return;
    _attached = true;

    window.addEventListener('keydown', (event) => EventDispatcher.dispatchEvent('keydown', event));
    window.addEventListener('keyup', (event) => EventDispatcher.dispatchEvent('keyup', event));

    window.addEventListener('mousedown', (event) => EventDispatcher.dispatchEvent('mousedown', event));
    window.addEventListener('mouseup', (event) => EventDispatcher.dispatchEvent('mouseup', event));
    window.addEventListener('mousemove', (event) => EventDispatcher.dispatchEvent('mousemove', event));

    window.addEventListener('focus', (event) => EventDispatcher.dispatchEvent('focus', event));
    window.addEventListener('blur', (event) => EventDispatcher.dispatchEvent('blur', event));
    window.addEventListener('resize', (event) => EventDispatcher.dispatchEvent('resize', event));

    window.addEventListener('wheel', (event) => EventDispatcher.dispatchEvent('wheel', event));

    // Events to ignore
    window.addEventListener('contextmenu', (event) => event.preventDefault());
  }
}