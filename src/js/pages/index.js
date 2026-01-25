import { BoxGeometry, Mesh, MeshNormalMaterial, PerspectiveCamera, Raycaster, Scene, Vector2 as ThreeV2, WebGLRenderer } from "three";
import { PhysicsWorld } from "../physics/physics-world.js";
import { getMouseCoordsFromPixel, resizeRenderView } from "../util/three-utils.js";
import { DraggableShape } from "../game/draggable-shape.js";
import { COMP_RIGIDBODY, RigidbodyComponent } from "../game/components/rigidbody.js";
import { Component } from "../game/components/component.js";
import tickManager from "../tick-manager.js";
import eventDispatcher from "../event-dispatcher.js";
import gameState from "../game/game-state.js";

// threejs init
const camera = new PerspectiveCamera(70, 16/9, 0.01, 10);
camera.position.z = 1;
gameState.mainCamera = camera;

const scene = new Scene();
gameState.scene = scene;

const geometry = new BoxGeometry(0.2, 0.2, 0.2);
const material = new MeshNormalMaterial();

const mesh = new Mesh(geometry, material);
mesh.position.x = 0.5;

scene.add(mesh);

const renderer = new WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);

document.body.appendChild(renderer.domElement);

// Game state init
tickManager.start();

// Manage events
function onFocus() {
  eventDispatcher.dispatchEvent('focus');
  tickManager.start();
}
window.addEventListener('focus', onFocus);

function onBlur() {
  eventDispatcher.dispatchEvent('blur');
  tickManager.pause();
}
window.addEventListener('blur', onBlur);
  
function onResize() {
  eventDispatcher.dispatchEvent('resize');
  resizeRenderView(renderer, camera, window.innerWidth, window.innerHeight);
}
window.addEventListener('resize', onResize);
resizeRenderView(renderer, camera, window.innerWidth, window.innerHeight);

const mouseRaycaster = new Raycaster();
/** @param {PointerEvent} pointerEvent */
function onMouseDown(pointerEvent) {
  eventDispatcher.dispatchEvent('mousedown');

  const point = getMouseCoordsFromPixel(pointerEvent.clientX, pointerEvent.clientY);
  mouseRaycaster.setFromCamera(new ThreeV2(...point), camera);
  const intersects = mouseRaycaster.intersectObjects(scene.children);
  if (intersects.length > 0) {
    eventDispatcher.dispatchEvent('objectclicked', intersects.at(0));
  }
}
window.addEventListener('mousedown', onMouseDown);

function onMouseUp() {
  eventDispatcher.dispatchEvent('mouseup');
}
window.addEventListener('mouseup', onMouseUp);

/** @param {PointerEvent} pointerEvent */
function onMouseMove(pointerEvent) {
  gameState.mousePosition.x = pointerEvent.clientX;
  gameState.mousePosition.y = pointerEvent.clientY;
  eventDispatcher.dispatchEvent('mousemove', pointerEvent);
}
window.addEventListener('mousemove', onMouseMove);

/** @param {Event} event */
function onWheel(event) {
  eventDispatcher.dispatchEvent('wheel', event);
}
window.addEventListener('wheel', onWheel);

// Game Init
const world = new PhysicsWorld();

const box = new DraggableShape(new BoxGeometry(0.2, 0.2, 0.2), new MeshNormalMaterial());
scene.add(box.mesh);
{
  const boxRb = box.rigidbodyComponent;
  boxRb.collider.visible = true;
  world.addBody(boxRb);
  scene.add(boxRb.collider.mesh);
}

tickManager.setCallback((dt) => {
  world.step(dt);
  world.update();

  box.update(dt);

  renderer.render(scene, camera);
});