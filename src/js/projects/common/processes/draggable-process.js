import { Camera, Raycaster, Vector3 as ThreeV3, Vector2 as ThreeV2, Color } from "three";
import { COMP_RIGIDBODY, RigidbodyComponent } from "../components/rigidbody.js";
import { EventDispatcher } from "../event/event-dispatcher.js";
import { Vector3 } from "../math/vector3.js";
import { GameState } from "../game/game-state.js";
import { ComponentManager } from "../game/component-manager.js";
import { getMouseCoordsFromPixel } from "../util/window-utils.js";
import { DraggableComponent } from "../components/draggable-body.js";
import { getLocalPosition, getWorldForward, getWorldPosition } from "../util/transform-utils.js";
import { addForceAtPosition } from "../util/physics-utils.js";
import { DebugProcess } from "./debug-process.js";
import { Quaternion } from "../math/quaternion.js";

/** @type {DraggableComponent[]} */
const _bodies = [];

/** @type {DraggableComponent | null} */
let _dragComponent = null;
/** @type {RigidbodyComponent | null} */
let _draggedRigidbody = null;
/** @type {Vector3 | null} */
let _localDragPoint = null;

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

  _draggedRigidbody = ComponentManager.getComponent(_dragComponent.entity, COMP_RIGIDBODY);

  _dragging = true;
  const cameraWorldPos = new ThreeV3();
  _camera.getWorldPosition(cameraWorldPos);

  const f = getWorldForward(_dragComponent.entity.transform);
  _localDragPoint = Vector3.subtract(intersection.point, getWorldPosition(new Vector3(), _dragComponent.entity.transform));
  const localDragDistance = _localDragPoint.magnitude;
  const a = Vector3.cross(f, _localDragPoint);
  const q = new Quaternion(1 + Vector3.dot(f, _localDragPoint.normalized), ...a).normalized;
  _localDragPoint = f.rotate(q).multiply(localDragDistance);
  console.log(_localDragPoint.magnitude);

  DebugProcess.drawPoints({ points: [getWorldPosition(_localDragPoint, _dragComponent.entity.transform)], color: new Color(0x00ff00), lifespan: 2 });

  _dragStartDistance = Math.max(_dragComponent.entity.transform.position.distanceTo(cameraWorldPos), 1);

  if (_wheelListener != null) EventDispatcher.stopListening('wheel', _wheelListener);
  _wheelListener = EventDispatcher.listenToEvent('wheel', (/**@type {WheelEvent}*/ wheelEvent) => {
    _dragStartDistance -= wheelEvent.deltaY / 1000;
  });

  if (_mouseUpListener != null) EventDispatcher.stopListening('mouseup', _mouseUpListener);
  _mouseUpListener = EventDispatcher.listenToEvent('mouseup', () => {
    _dragging = false;
    if (_draggedRigidbody) _draggedRigidbody.noForces = false;
    _dragComponent = null;
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

  /** @param {number} dt */
  update: (dt) => {
    if (!_dragging || !_dragComponent?.entity || !_camera || !_localDragPoint) {
      return;
    }

    const coords = getMouseCoordsFromPixel(GameState.mousePosition.x, GameState.mousePosition.y);

    const dummyRaycaster = new Raycaster();
    dummyRaycaster.setFromCamera(new ThreeV2(...coords), _camera);
    const desiredPos = new Vector3(...dummyRaycaster.ray.direction);
    desiredPos.multiply(_dragStartDistance);
    const cameraWorldPos = new ThreeV3();
    _camera.getWorldPosition(cameraWorldPos);
    desiredPos.addv3(cameraWorldPos);

    const rotatedPoint = Vector3.rotate(_localDragPoint, _dragComponent.entity.transform.orientation);

    DebugProcess.drawPoints({ points: [desiredPos], color: new Color(0xff0000) });
    DebugProcess.drawPoints({ points: [getWorldPosition(rotatedPoint, _dragComponent.entity.transform)] });

    DebugProcess.drawLine({ points: [
      getWorldPosition(new Vector3(), _dragComponent.entity.transform),
      getWorldPosition(rotatedPoint, _dragComponent.entity.transform)
    ]});

    if (_draggedRigidbody?.entity) {
      const worldDragPoint = getWorldPosition(rotatedPoint, _dragComponent.entity.transform);
      const desiredVelocity = new Vector3(
        (desiredPos.x - worldDragPoint.x) * 2,
        (desiredPos.y - worldDragPoint.y) * 2,
        (desiredPos.z - worldDragPoint.z) * 2
      );
      const difference = Vector3.subtract(desiredVelocity, _draggedRigidbody.bodyState.velocity);
      const derivedForce = difference.multiply(_draggedRigidbody.bodyState.mass).divide(Math.max(dt, 0.0167));
      addForceAtPosition(_draggedRigidbody, derivedForce, rotatedPoint);
      /**
       * v = (momentum * dt) / mass
       * v * mass = momentum * dt
       * (v * mass) / dt = momentum
       */
    } else {
      _dragComponent.entity.transform.position.setv3(desiredPos);
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
    _dragging = false;
    _dragStartDistance = 0;
    _camera = null;
  }
};