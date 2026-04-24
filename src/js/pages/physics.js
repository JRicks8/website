import { PerspectiveCamera, Raycaster, Scene, Vector2 as ThreeV2, WebGLRenderer } from "three";
import { resizeRenderView } from "../projects/common/util/three-utils.js";
import { GameState } from "../projects/common/game/game-state.js";
import { TickProcess } from "../projects/common/processes/tick-process.js";
import { EventDispatcher } from "../projects/common/event/event-dispatcher.js";
import { buildDraggableBody } from "../projects/birds/factory/draggable-body-factory.js";
import { Registry } from "../projects/common/game/register.js";
import { MeshRenderingProcess } from "../projects/common/processes/mesh-rendering-process.js";
import { PhysicsProcess } from "../projects/common/processes/physics-process.js";
import { buildFlyingFPController } from "../projects/common/factory/player-controller-factory.js";
import { InputListener } from "../projects/common/event/input-listener.js";
import { COMP_PLAYER_CONTROLLER, PlayerControllerComponent } from "../projects/common/components/player-controller.js";
import { PlayerProcess } from "../projects/common/processes/player-process.js";
import { ComponentManager } from "../projects/common/game/component-manager.js";
import { DraggableProcess } from "../projects/common/processes/draggable-process.js";
import { ScriptProcess } from "../projects/common/processes/script-process.js";
import { getMouseCoordsFromPixel } from "../projects/common/util/window-utils.js";
import { LAYER_IGNORE_ALL, LAYER_IGNORE_RAYCAST } from "../projects/common/util/layers.js";
import { DebugProcess } from "../projects/common/processes/debug-process.js";
import { Vector3 } from "../projects/common/math/vector3.js";
import { addTorque } from "../projects/common/util/physics-utils.js";
import { COMP_RIGIDBODY } from "../projects/common/components/rigidbody.js";

// threejs init
const camera = new PerspectiveCamera(70, 16/9, 0.01, 100);
GameState.mainCamera = camera;

const scene = new Scene();
GameState.scene = scene;

const renderer = new WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);

document.body.appendChild(renderer.domElement);

// Manage events ------------------------------------------------------------
InputListener.attachListeners();

EventDispatcher.listenToEvent('focus', () => {
  TickProcess.start();
});

EventDispatcher.listenToEvent('blur', () => {
  TickProcess.pause();
});
  
EventDispatcher.listenToEvent('resize', () => resizeRenderView(renderer, camera, window.innerWidth, window.innerHeight));
resizeRenderView(renderer, camera, window.innerWidth, window.innerHeight);

const mouseRaycaster = new Raycaster();
EventDispatcher.listenToEvent('mousedown', (/**@type {MouseEvent}*/ mouseEvent) => {
  const point = getMouseCoordsFromPixel(mouseEvent.clientX, mouseEvent.clientY);
  mouseRaycaster.setFromCamera(new ThreeV2(...point), camera);
  mouseRaycaster.layers.disable(LAYER_IGNORE_ALL);
  mouseRaycaster.layers.disable(LAYER_IGNORE_RAYCAST);
  const intersects = mouseRaycaster.intersectObjects(scene.children);
  if (intersects.length > 0) {
    EventDispatcher.dispatchEvent('objectclicked', intersects.at(0));
  }
});

EventDispatcher.listenToEvent('mousemove', (/**@type {MouseEvent}*/ mouseEvent) => {
  GameState.mousePosition.x = mouseEvent.clientX;
  GameState.mousePosition.y = mouseEvent.clientY;
});

// Game Setup ----------------------------------------------------------
DraggableProcess.initialize(camera);
DebugProcess.initialize(scene);

// PhysicsProcess.globalConstantForce.y = -9.81;

Registry.setContext('physics');

const b1 = buildDraggableBody(Registry.getUniqueId(), scene, 0.5);
Registry.register(b1, b1.id);
b1.transform.position.set(2, 0, -5);

const b2 = buildDraggableBody(Registry.getUniqueId(), scene, 2);
Registry.register(b2, b2.id);
b2.transform.position.set(-2, 0, -5);

// Player setup -----------------------------------------------
PlayerProcess.setup(scene, camera);
const player = buildFlyingFPController(Registry.getUniqueId(), camera);
/** @type {PlayerControllerComponent} */
const playerController = ComponentManager.getComponent(player, COMP_PLAYER_CONTROLLER);
playerController.speed = 5;
Registry.register(player, player.id);

// Game loop -------------------------------------------------
TickProcess.setCallback((dt) => {
  ScriptProcess.earlyUpdate(dt);

  PlayerProcess.update(playerController, dt);

  DraggableProcess.update(dt);

  PhysicsProcess.step(dt);
  PhysicsProcess.update();

  ScriptProcess.update(dt);

  MeshRenderingProcess.update();

  DebugProcess.beforeRender();
  ScriptProcess.lateUpdate(dt);
  renderer.render(scene, camera);
  DebugProcess.afterRender(dt);
});
TickProcess.setTickDuration(0);
TickProcess.start();