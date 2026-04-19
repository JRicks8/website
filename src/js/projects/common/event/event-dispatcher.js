/** @type {{[event: string]: {[id: number]: function}}} */
const events = {};
let counter = 0;

export const EventDispatcher = {
  /**
   * Attach the provided callback to the desired event, where the callback
   * is invoked every time the event is triggered. If the event entry does not 
   * exist, a new event is created.
   * @param {string} event 
   * @param {(...args: any[]) => void} callback 
   * @returns {number} The listener ID (required to stop listening to the event)
   */
  listenToEvent: (event, callback) => {
    events[event] ??= {};
    events[event][counter] = callback;
    return counter++;
  },

  /**
   * Invokes the callbacks attached to this event.
   * @param {string} event 
   * @param {unknown[]} args
   */
  dispatchEvent: (event, ...args) => {
    if (!events[event]) return;
    for (const callback of Object.values(events[event])) callback(...args);
  },

  /**
   * Removes the listener from the callback list.
   * @param {string} event 
   * @param {number} listenerId 
   */
  stopListening: (event, listenerId) => {
    delete events[event]?.[listenerId];
  }
};