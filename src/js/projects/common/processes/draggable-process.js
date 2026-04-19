import { Camera, Raycaster, Vector3 as ThreeV3, Vector2 as ThreeV2 } from "three";
import { COMP_RIGIDBODY, RigidbodyComponent } from "../components/rigidbody.js";
import { EventDispatcher } from "../event/event-dispatcher.js";
import { Vector3 } from "../math/vector3.js";
import { GameState } from "../game/game-state.js";
import { COMP_TRANSFORM, TransformComponent } from "../components/transform.js";
import { ComponentManager } from "../game/component-manager.js";
import { getMouseCoordsFromPixel } from "../util/window-utils.js";
import { DraggableComponent } from "../components/draggable-body.js";

/** @type {DraggableComponent[]} */
const _bodies = [];

/** @type {DraggableComponent | null} */
let _dragComponent = null;
/** @type {TransformComponent | null} */
let _draggedTransform = null;
/** @type {RigidbodyComponent | null} */
let _draggedRigidbody = null;

let _dragging = false;
let _dragStartDistance = 0;

/** @type {Camera | null} */
let _camera = null;

/** @type {number | null} */
let _objectClickedListener = null;
/** @type {number | null} */
let _wheelListener = null;
/** @type {number | null} */
let _mouseUpListener = null;

/**
 * When the mouse is pressed down and a raycast is made and intersects
 * with an object, this is invoked
 * @param {import("three").Intersection} intersection
 */
function onMouseDownRaycast(intersection) {
  _dragComponent = _bodies.find(b => b.colliderComponent?.colliderMesh === intersection.object) || null;
  startDragging(intersection);
}

/** @param {import("three").Intersection} intersection */
function startDragging(intersection) {
  if (!_dragComponent?.entity || !_camera) {
    return;
  }

  _draggedTransform = ComponentManager.getComponent(_dragComponent.entity, COMP_TRANSFORM);
  if (!_draggedTransform) {
    console.error('Dragged body has no transform!');
  }

  _draggedRigidbody = ComponentManager.getComponent(_dragComponent.entity, COMP_RIGIDBODY);
  if (_draggedRigidbody) {
    _draggedRigidbody.noForces = true;
  }

  _dragging = true;
  _dragStartDistance = Math.max(intersection.object.position.distanceTo(_camera.position), 0.5);

  if (_wheelListener != null) EventDispatcher.stopListening('wheel', _wheelListener);
  _wheelListener = EventDispatcher.listenToEvent('wheel', (/**@type {WheelEvent}*/ wheelEvent) => {
    _dragStartDistance -= wheelEvent.deltaY / 1000;
  });

  if (_mouseUpListener != null) EventDispatcher.stopListening('mouseup', _mouseUpListener);
  _mouseUpListener = EventDispatcher.listenToEvent('mouseup', () => {
    _dragging = false;
    if (_draggedRigidbody) _draggedRigidbody.noForces = false;
    _dragComponent = null;
    _draggedTransform = null;
    if (_mouseUpListener != null) EventDispatcher.stopListening('mouseup', _mouseUpListener);
    if (_wheelListener != null) EventDispatcher.stopListening('wheel', _wheelListener);
  });
}

export const DraggableProcess = {
  /**
   * Set up this process. This process needs a camera to operate correctly.
   * @param {Camera} camera 
   */
  initialize: (camera) => {
    _objectClickedListener = EventDispatcher.listenToEvent('objectclicked', (intersection) => onMouseDownRaycast(intersection));
    _camera = camera;
  },

  /** @param {Camera} camera */
  setCamera: (camera) => {
    _camera = camera;
  },

  /** @param {DraggableComponent} body */
  add: (body) => {
    _bodies.push(body);
  },

  /** 
   * @param {DraggableComponent} body 
   * @returns {DraggableComponent | undefined} The removed draggable body component
   */
  remove: (body) => {
    const bodyIndex = _bodies.findIndex(b => b === body);
    if (_bodies.splice(bodyIndex, 1).length > 0) {
      return body;
    }
  },

  update: () => {
    if (!_dragging || !_dragComponent || !_camera || !_draggedTransform) {
      return;
    }

    const cameraUp = _camera.up;
    const cameraRight = new ThreeV3(cameraUp.x, 0, cameraUp.z).normalize();
    cameraRight.cross(cameraUp).normalize();

    const coords = getMouseCoordsFromPixel(GameState.mousePosition.x, GameState.mousePosition.y);
    const dummyRaycaster = new Raycaster();
    dummyRaycaster.setFromCamera(new ThreeV2(...coords), GameState.mainCamera);
    const desiredPos = new Vector3(...dummyRaycaster.ray.direction);
    desiredPos.multiply(_dragStartDistance);
    desiredPos.addv3(new Vector3(...GameState.mainCamera.position));

    if (_draggedRigidbody) {
      _draggedRigidbody.bodyState.velocity.set(
        (desiredPos.x - _draggedTransform.position.x) * 2,
        (desiredPos.y - _draggedTransform.position.y) * 2,
        (desiredPos.z - _draggedTransform.position.z) * 2
      );
    } else {
      _draggedTransform.position.setv3(desiredPos);
    }
  },

  cleanup: () => {
    EventDispatcher.stopListening('objectclicked', _objectClickedListener || 0);
    _objectClickedListener = null;
    EventDispatcher.stopListening('objectclicked', _wheelListener || 0);
    _wheelListener = null;
    EventDispatcher.stopListening('objectclicked', _mouseUpListener || 0);
    _mouseUpListener = null;

    for (const body of _bodies) {
      if (body.entity) ComponentManager.removeAllComponents(body.entity);
    }

    _bodies.length = 0;
    _dragComponent = null;
    _draggedTransform = null;
    _dragging = false;
    _dragStartDistance = 0;
    _camera = null;
  }
};