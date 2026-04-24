import { Camera, Euler, Object3D, Quaternion, Scene, Vector3 as ThreeV3 } from "three";
import { PlayerControllerComponent } from "../components/player-controller.js";
import { EventDispatcher } from "../event/event-dispatcher.js";
import { GameState } from "../game/game-state.js";
import { Vector2 } from "../math/vector2.js";
import { Vector3 } from "../math/vector3.js";
import { clamp, clampWrap, toDegrees } from "../math/common.js";

let _initialized = false;
let _lastMousePosition = new Vector2();

/** @type {{[key: string]: boolean}} */
const _keysDown = {};
let _lmb = false;
let _rmb = false;

let _pitch = 0;
let _yaw = 0;

const _playerObject = new Object3D();
const _pitchObject = new Object3D();
const _yawObject = new Object3D();

export const PlayerProcess = {
  /**
   * @param {Scene} scene 
   * @param {Camera} camera 
   * @returns 
   */
  setup: (scene, camera) => {
    if (_initialized) return;
    EventDispatcher.listenToEvent('keydown', (/**@type {KeyboardEvent}*/ keyEvent) => {
      _keysDown[keyEvent.key] = true;
    });
    EventDispatcher.listenToEvent('keyup', (/**@type {KeyboardEvent}*/ keyEvent) => {
      _keysDown[keyEvent.key] = false;
    });
    EventDispatcher.listenToEvent('mousedown', (/**@type {MouseEvent}*/ mouseEvent) => {
      if (mouseEvent.button === 2) _rmb = true;
      if (mouseEvent.button === 0) _lmb = true;
    });
    EventDispatcher.listenToEvent('mouseup', (/**@type {MouseEvent}*/ mouseEvent) => {
      if (mouseEvent.button === 2) _rmb = false;
      if (mouseEvent.button === 0) _lmb = false;
    });

    _playerObject.position.copy(camera.position);
    camera.position.set(0, 0, 0);

    scene.add(_playerObject);
    _playerObject.add(_yawObject);
    _yawObject.add(_pitchObject);
    _pitchObject.add(camera);

    _yawObject.setRotationFromQuaternion(new Quaternion().identity());
    _pitchObject.setRotationFromQuaternion(new Quaternion().identity());

    _initialized = true;
  },

  /**
   * Updates the input player controller with the player's inputs.  
   * The camera assigned to this player controller is moved, not the transform of the entity 
   * this controller is assigned to.
   * @param {PlayerControllerComponent} controller
   * @param {number} dt
   */
  update: (controller, dt) => {
    if (!controller.entity || !controller.camera) return;

    const forward = new ThreeV3();
    controller.camera.getWorldDirection(forward);
    const right = new ThreeV3(forward.x, forward.y, forward.z).cross(Vector3.up).normalize();
    
    if (controller.canRotate && _rmb) {
      const dx = _lastMousePosition.x - GameState.mousePosition.x;
      const dy = _lastMousePosition.y - GameState.mousePosition.y;

      _pitch += dy * controller.mouseSensitivity;
      _yaw += dx * controller.mouseSensitivity;
      clampWrap(_yaw, -Math.PI * 2, Math.PI * 2);
      clamp(_pitch, -1.55, 1.55);

      _yawObject.rotation.y += dx * controller.mouseSensitivity;
      _pitchObject.rotation.x += dy * controller.mouseSensitivity;
      _pitchObject.rotation.x = clamp(_pitchObject.rotation.x, - (Math.PI / 2), Math.PI / 2);
    }

    const move = new Vector3();
    if (controller.canMove && _playerObject) {
      if (_keysDown['w']) move.addv3(forward);
      if (_keysDown['s']) move.subtractv3(forward);
      if (_keysDown['a']) move.subtractv3(right);
      if (_keysDown['d']) move.addv3(right);
      if (controller.flying) {
        if (_keysDown['e']) move.y += controller.speed;
        if (_keysDown['q']) move.y -= controller.speed;
      }
      move.normalize();
      move.multiply(controller.speed, dt);

      _playerObject.position.add(move);
    }

    _lastMousePosition.setv2(GameState.mousePosition);
  },

  /**
   * @returns {Object3D}
   */
  getPlayerObject: () => {
    return _playerObject;
  }
};