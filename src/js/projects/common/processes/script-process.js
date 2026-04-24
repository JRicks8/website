import { ScriptComponent } from "../game/script.js";

/** @type {ScriptComponent[]} */
const _enabledScripts = [];

/** @type {ScriptComponent[]} */
const _disabledScripts = [];

/** @type {ScriptComponent[]} */
const _newScripts = [];

/**
 * @param {ScriptComponent[]} arr
 * @param {number} i
 */
function removeAt(arr, i) {
  const last = arr.length - 1;
  if (i === last) {
    arr.pop();
    return;
  }
  [arr[i], arr[last]] = [arr[last], arr[i]];
  arr.pop();
}

/**
 * @param {ScriptComponent[]} arr
 * @param {ScriptComponent} component
 * @returns {boolean}
 */
function removeFromArray(arr, component) {
  const i = arr.indexOf(component);
  if (i < 0) return false;
  removeAt(arr, i);
  return true;
}

/** Newly added scripts: move into enabled/disabled buckets and invoke onEnable when enabled. */
function flushNewScripts() {
  if (_newScripts.length === 0) return;
  const pending = _newScripts.slice();
  _newScripts.length = 0;
  for (const script of pending) {
    if (script.enabled) {
      _enabledScripts.push(script);
      script.onEnable();
    } else {
      _disabledScripts.push(script);
    }
  }
}

/** React to ScriptComponent.enabled toggles between frames. */
function applyEnableDisableTransitions() {
  for (let k = 0; k < _enabledScripts.length; ) {
    const script = _enabledScripts[k];
    if (!script.enabled) {
      removeAt(_enabledScripts, k);
      _disabledScripts.push(script);
      script.onDisable();
    } else {
      k++;
    }
  }
  for (let k = 0; k < _disabledScripts.length; ) {
    const script = _disabledScripts[k];
    if (script.enabled) {
      removeAt(_disabledScripts, k);
      _enabledScripts.push(script);
      script.onEnable();
    } else {
      k++;
    }
  }
}

export const ScriptProcess = {
  /** @param {ScriptComponent} component */
  add: (component) => {
    _newScripts.push(component);
  },

  /** @param {ScriptComponent} component */
  remove: (component) => {
    if (_enabledScripts.includes(component)) {
      component.onDisable();
    }
    removeFromArray(_enabledScripts, component);
    removeFromArray(_disabledScripts, component);
    removeFromArray(_newScripts, component);
  },

  /**
   * Early updates happen before any other processes.
   * @param {number} dt
   */
  earlyUpdate: (dt) => {
    flushNewScripts();
    applyEnableDisableTransitions();
    for (const script of _enabledScripts) {
      script.earlyUpdate(dt);
    }
  },

  /**
   * Updates happen right after physics and input processes.
   * @param {number} dt
   */
  update: (dt) => {
    for (const script of _enabledScripts) {
      script.update(dt);
    }
  },

  /**
   * Late updates happen just before the scene is rendered.
   * @param {number} dt
   */
  lateUpdate: (dt) => {
    for (const script of _enabledScripts) {
      script.lateUpdate(dt);
    }
  },
};
