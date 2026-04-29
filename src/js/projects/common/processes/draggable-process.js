import { Camera, Raycaster, Vector3 as ThreeV3, Vector2 as ThreeV2, Color } from "three";
import { COMP_RIGIDBODY, RigidbodyComponent } from "../components/rigidbody.js";
import { EventDispatcher } from "../event/event-dispatcher.js";
import { Vector3 } from "../math/vector3.js";
import { GameState } from "../game/game-state.js";
import { ComponentManager } from "../game/component-manager.js";
import { getMouseCoordsFromPixel } from "../util/window-utils.js";
import { DraggableComponent } from "../components/draggable-body.js";
import { getWorldPosition } from "../util/transform-utils.js";
import { DebugProcess } from "./debug-process.js";
import { addForceAtPosition } from "../util/physics-utils.js";

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

let _dragForce = 1;

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

/**
 * Gets the position of the mouse in world space by extended a vector from the 
 * camera in the perceived direction of the mouse.
 * @param {Camera} camera
 * @returns {Vector3}
 */
function getMousePos(camera) {
  const coords = getMouseCoordsFromPixel(GameState.mousePosition.x, GameState.mousePosition.y);
  // Get the direction the mouse is pointing in using this three.js raycaster
  const dummyRaycaster = new Raycaster();
  dummyRaycaster.setFromCamera(new ThreeV2(...coords), camera);
  const mousePos = new Vector3(...dummyRaycaster.ray.direction);
  
  // Calculate the desired (world) position
  const cameraWorldPos = new ThreeV3();
  camera.getWorldPosition(cameraWorldPos);
  mousePos.multiply(_dragDesiredDistance).addv3(cameraWorldPos);
  return mousePos;
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

    const mousePos = getMousePos(_camera);

    const rotatedLocalPoint = Vector3.rotate(_localDragPoint, _dragComponent.entity.transform.orientation);

    // Desired (world) position
    DebugProcess.drawPoints({ points: [mousePos], color: new Color(0xff0000) });
    // Local drag point translated to world position
    DebugProcess.drawPoints({ points: [getWorldPosition(_dragComponent.entity.transform, rotatedLocalPoint)] });

    DebugProcess.drawLine({ points: [
      getWorldPosition(_dragComponent.entity.transform),
      getWorldPosition(_dragComponent.entity.transform, rotatedLocalPoint)
    ]});

    if (_draggedRigidbody?.entity) {
      const worldDragPoint = getWorldPosition(_dragComponent.entity.transform, rotatedLocalPoint);

      DebugProcess.drawPoints({ points: [worldDragPoint], color: new Color(0x00ff00) });

      // Need to simulate dragging with the mouse using physics.

      // Here's the plan:

      // Simulate this as a spring. One end is on the point on the object which we are dragging, and the other 
      // is attached to the point in space where the mouse appears to be.
      // We'll call these points p1 and p2, respectively

      // The force exerted by the spring is:
      // f = k * M
      // k: spring constant (N/m) or, how much force is required to compress the spring by one meter
      // M: distance (m) the distance between p1 and p2

      // First, project the vector p1 -> p2 onto two vectors:
      // - The first is p1 -> center of mass of the object
      // - The second is a vector perpendicular to the first
      // We'll be applying a linear force to the object with the first one, then a torque with the second

      // TODO: Figure out how to have the second vector apply torque in the direction that would be
      // required to have the first vector parallel with p1 -> p2

      const forceDir = Vector3.subtract(mousePos, worldDragPoint).normalize();
      const totalForce = Vector3.multiply(forceDir, _dragForce, _draggedRigidbody.bodyState.mass);

      addForceAtPosition(_draggedRigidbody, totalForce, rotatedLocalPoint);
      
      DebugProcess.drawLine({
        points: [
          getWorldPosition(_dragComponent.entity.transform, rotatedLocalPoint),
          Vector3.addv3(totalForce.normalized, getWorldPosition(_dragComponent.entity.transform, rotatedLocalPoint))
        ]
      });

    } else {
      _dragComponent.entity.transform.position.setv3(mousePos);
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