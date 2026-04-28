import { Camera, Raycaster, Vector3 as ThreeV3, Vector2 as ThreeV2, Color } from "three";
import { COMP_RIGIDBODY, RigidbodyComponent } from "../components/rigidbody.js";
import { EventDispatcher } from "../event/event-dispatcher.js";
import { Vector3 } from "../math/vector3.js";
import { GameState } from "../game/game-state.js";
import { ComponentManager } from "../game/component-manager.js";
import { getMouseCoordsFromPixel } from "../util/window-utils.js";
import { DraggableComponent } from "../components/draggable-body.js";
import { getWorldPosition } from "../util/transform-utils.js";
import { addForceAtPosition, velocityAtPoint } from "../util/physics-utils.js";
import { DebugProcess } from "./debug-process.js";

/** @type {DraggableComponent[]} */
const _bodies = [];

/** @type {DraggableComponent | null} */
let _dragComponent = null;
/** @type {RigidbodyComponent | null} */
let _draggedRigidbody = null;
/** @type {Vector3 | null} */
let _localDragPoint = null;

let _dragging = false;
let _dragDesiredDistance = 0;

/** @type {Camera | null} */
let _camera = null;

/** @type {number | null} */
let _objectClickedListener = null;
/** @type {number | null} */
let _wheelListener = null;
/** @type {number | null} */
let _mouseUpListener = null;

let _kp = 8;
let _kd = 28;

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

  // - Get local vector v_l to point and record magnitude m
  // - normalize v_l
  // - Rotate v_l by inverse of transform orientation
  // - multiply v_l by m 
  // This should be the local (unrotated) position of the clicked location

  _localDragPoint = Vector3.subtract(intersection.point, _dragComponent.entity.transform.position);
  const m = _localDragPoint.magnitude;
  _localDragPoint.normalize().rotate(_dragComponent.entity.transform.orientation.inverse()).multiply(m);

  _dragDesiredDistance = Math.max(intersection.point.distanceTo(cameraWorldPos), 1);

  if (_wheelListener != null) EventDispatcher.stopListening('wheel', _wheelListener);
  _wheelListener = EventDispatcher.listenToEvent('wheel', (/**@type {WheelEvent}*/ wheelEvent) => {
    _dragDesiredDistance -= wheelEvent.deltaY / 1000;
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

    // Get the direction the mouse is pointing in using this three.js raycaster
    const dummyRaycaster = new Raycaster();
    dummyRaycaster.setFromCamera(new ThreeV2(...coords), _camera);
    const desiredPos = new Vector3(...dummyRaycaster.ray.direction);
    
    // Calculate the desired (world) position
    const cameraWorldPos = new ThreeV3();
    _camera.getWorldPosition(cameraWorldPos);
    desiredPos.multiply(_dragDesiredDistance).addv3(cameraWorldPos);

    const rotatedLocalPoint = Vector3.rotate(_localDragPoint, _dragComponent.entity.transform.orientation);

    // Desired (world) position
    DebugProcess.drawPoints({ points: [desiredPos], color: new Color(0xff0000) });
    // Local drag point translated to world position
    DebugProcess.drawPoints({ points: [getWorldPosition(rotatedLocalPoint, _dragComponent.entity.transform)] });

    DebugProcess.drawLine({ points: [
      getWorldPosition(new Vector3(), _dragComponent.entity.transform),
      getWorldPosition(rotatedLocalPoint, _dragComponent.entity.transform)
    ]});

    if (_draggedRigidbody?.entity) {
      const worldDragPoint = getWorldPosition(rotatedLocalPoint, _dragComponent.entity.transform);

      DebugProcess.drawPoints({ points: [worldDragPoint], color: new Color(0x00ff00) });

      // Find desired velocity of the point
      const currentPointVelocity = velocityAtPoint(_draggedRigidbody, rotatedLocalPoint);
      const positionError = Vector3.subtract(desiredPos, worldDragPoint);
      const desiredPointVelocity = Vector3.multiply(positionError, _kp);
      const velocityError = Vector3.subtract(desiredPointVelocity, currentPointVelocity);
      const derivedForce = Vector3.multiply(velocityError, _draggedRigidbody.bodyState.mass, _kd);

      console.log(currentPointVelocity.toString());

      addForceAtPosition(_draggedRigidbody, derivedForce.normalized, rotatedLocalPoint);

      DebugProcess.drawLine({ 
        color: new Color(0xff0000),
        points: [
          worldDragPoint,
          Vector3.addv3(worldDragPoint, currentPointVelocity)
        ], 
      });
      
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
    _dragDesiredDistance = 0;
    _camera = null;
  }
};