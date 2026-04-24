import { Camera } from "three";
import { Component } from "./class/component.js";

export const COMP_PLAYER_CONTROLLER = 'PlayerController';

export class PlayerControllerComponent extends Component {
  flying = true;
  noclip = true;
  canMove = true;
  canRotate = true;
  speed = 1;
  mouseSensitivity = 0.005;
  forwardOffset = 1;

  /** @type {Camera | null} */
  camera = null;

  constructor() {
    super(COMP_PLAYER_CONTROLLER);
  }
}