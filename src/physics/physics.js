import { BoxGeometry, Mesh, MeshNormalMaterial, PerspectiveCamera, Raycaster, Scene, SphereGeometry, Vector2 as ThreeV2, WebGLRenderer } from "three";
import { resizeRenderView } from "../js/projects/common/util/three-utils.js";
import { GameState } from "../js/projects/common/game/game-state.js";
import { TickProcess } from "../js/projects/common/processes/tick-process.js";
import { EventDispatcher } from "../js/projects/common/event/event-dispatcher.js";
import { entityBuilder } from "../js/projects/birds/builder/entity-builder.js";
import { Registry } from "../js/projects/common/game/register.js";
import { MeshRenderingProcess } from "../js/projects/common/processes/mesh-rendering-process.js";
import { PhysicsProcess } from "../js/projects/common/processes/physics-process.js";
import { buildFlyingFPController } from "../js/projects/common/factory/player-controller-factory.js";
import { InputListener } from "../js/projects/common/event/input-listener.js";
import { COMP_PLAYER_CONTROLLER, PlayerControllerComponent } from "../js/projects/common/components/player-controller.js";
import { PlayerProcess } from "../js/projects/common/processes/player-process.js";
import { ComponentManager } from "../js/projects/common/game/component-manager.js";
import { DraggableProcess } from "../js/projects/common/processes/draggable-process.js";
import { ScriptProcess } from "../js/projects/common/processes/script-process.js";
import { getMouseCoordsFromPixel } from "../js/projects/common/util/window-utils.js";
import { LAYER_IGNORE_ALL, LAYER_IGNORE_RAYCAST } from "../js/projects/common/util/layers.js";
import { DebugProcess } from "../js/projects/common/processes/debug-process.js";
import { RigidbodyComponent } from "../js/projects/common/components/rigidbody.js";
import { DraggableComponent } from "../js/projects/common/components/draggable-body.js";
import { MeshRendererComponent } from "../js/projects/common/components/mesh-renderer.js";
import { BoxColliderComponent } from "../js/projects/common/components/collider/box-collider.js";

// threejs init
const camera = new PerspectiveCamera(70, 16/9, 0.01, 100);
camera.layers.enable(0);
camera.layers.enable(1);
GameState.mainCamera = camera;

const scene = new Scene();
GameState.scene = scene;

const renderer = new WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Manage events ------------------------------------------------------------
InputListener.attachListeners();

EventDispatcher.listenToEvent('focus', () => {
  GameState.hardPaused = false;
  TickProcess.start();
});

EventDispatcher.listenToEvent('blur', () => {
  GameState.hardPaused = true;
});

EventDispatcher.listenToEvent('keydown', (/**@type {KeyboardEvent}*/ keyEvent) => {
  if (keyEvent.key === 'Escape') {
    GameState.paused = !GameState.paused;
  }
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

const entity1 = entityBuilder()
  .colliderComponent(new BoxColliderComponent(), scene)
  .draggableComponent(new DraggableComponent())
  .meshRendererComponent(
    new MeshRendererComponent(
      new Mesh(
        new BoxGeometry(),
        new MeshNormalMaterial()
      )
    ), scene
  )
  .rigidbodyComponent(new RigidbodyComponent())
  .build();
entity1.transform.position.set(2, 0, -5)

const entity2 = entityBuilder()
  .colliderComponent(new BoxColliderComponent(), scene)
  .draggableComponent(new DraggableComponent())
  .meshRendererComponent(
    new MeshRendererComponent(
      new Mesh(
        new BoxGeometry(),
        new MeshNormalMaterial()
      )
    ), scene
  )
  .rigidbodyComponent(new RigidbodyComponent())
  .build();
entity2.transform.position.set(-2, 0, -5);

// Player setup -----------------------------------------------
PlayerProcess.setup(scene, camera);
const player = buildFlyingFPController(Registry.getUniqueId(), camera);
/** @type {PlayerControllerComponent} */
const playerController = ComponentManager.getComponent(player, COMP_PLAYER_CONTROLLER);
playerController.speed = 5;
Registry.register(player, player.id);

// Game loop -------------------------------------------------
TickProcess.setCallback((dt) => {
  const effectiveDt = GameState.paused ? 0 : dt;

  ScriptProcess.earlyUpdate(effectiveDt);

  PlayerProcess.update(playerController, dt); // Player process ignores game pause state

  DraggableProcess.update();

  PhysicsProcess.step(effectiveDt);
  PhysicsProcess.update();

  ScriptProcess.update(effectiveDt);

  MeshRenderingProcess.update();

  DebugProcess.beforeRender();
  ScriptProcess.lateUpdate(effectiveDt);
  renderer.render(scene, camera);
  DebugProcess.afterRender(effectiveDt);
});
TickProcess.setTickDuration(16);
TickProcess.start();