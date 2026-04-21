import { Component } from "../components/class/component.js";

export const COMP_SCRIPT = 'ScriptComponent';

export class ScriptComponent extends Component {
  enabled = true;
  onEnable = () => {};
  onDisable = () => {};
  awake = () => {};
  /** @type {(dt: number) => void} */
  earlyUpdate = (dt) => {};
  /** @type {(dt: number) => void} */
  update = (dt) => {};
  /** @type {(dt: number) => void} */
  lateUpdate = (dt) => {};

  constructor() {
    super(COMP_SCRIPT);
  }
}