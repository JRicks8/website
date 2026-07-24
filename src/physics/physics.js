import { BoxGeometry, CapsuleGeometry, ConeGeometry, CylinderGeometry, Mesh, MeshNormalMaterial, PerspectiveCamera, Raycaster, RingGeometry, Scene, SphereGeometry, Vector2 as ThreeV2, TubeGeometry, WebGLRenderer } from "three";
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
import { SimplexTester } from "../js/projects/common/collision/test/simplex-test.js";
import { Quaternion } from "../js/projects/common/math/quaternion.js";
import { Vector3 } from "../js/projects/common/math/vector3.js";
import { SupportTester } from "../js/projects/common/collision/test/support-test.js";
import { Matrix3x3 } from "../js/projects/common/math/matrix3x3.js";

// v: 1, 1, 1

// 0.7716996, -0.270596, 0.5712582, 0.0701545 ->
// -0.37, 1.27, 1.11, -0.07   ->
// out: 0.7604, 1.1356, -1.0516

// [  0.3374849, -0.4174367,  0.8437123
//   -0.2008839,  0.8437123,  0.4977903
//   -0.9196464, -0.3374849,  0.2008839 ]
// out: 0.763761, 1.14062, -1.05625

const q = new Quaternion(0.7716996, -0.270596, 0.5712582, 0.0701545);
// console.log(new Vector3(1, 1, 1).rotate(q));
const m = new Matrix3x3();
m.setValue([[0.3374849, -0.4174367,  0.8437123],[-0.2008839,  0.8437123,  0.4977903],[-0.9196464, -0.3374849,  0.2008839]]);
// console.log(Matrix3x3.multiplyVector3(m, new Vector3(1,1,1)));
// console.log(Quaternion.toMatrix(q));
// console.log(m);

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
  GameState.setHardPaused(false);
  TickProcess.start();
});

EventDispatcher.listenToEvent('blur', () => {
  GameState.setHardPaused(true);
});

const geometries = [
  new BoxGeometry(),
  new SphereGeometry(0.5),
  new ConeGeometry(0.5),
  new CapsuleGeometry(0.5),
  new CylinderGeometry(0.5, 0.5)
];
const supportTestShape = { geometry: new BoxGeometry(1, 1, 1, 1, 1, 1), localTransform: { orientation: new Quaternion(), position: new Vector3(0, 0, 0) } };
const simplexTestShapeA = { geometry: new BoxGeometry(1, 1, 1, 1, 1, 1), localTransform: { orientation: new Quaternion(), position: new Vector3(0, 0, 0) } };
const simplexTestShapeB = { geometry: new BoxGeometry(1, 1, 1, 1, 1, 1), localTransform: { orientation: new Quaternion(), position: new Vector3(0, 0, 0) } };
SupportTester.shape = supportTestShape;
SimplexTester.shapeA = simplexTestShapeA;
SimplexTester.shapeB = simplexTestShapeB;
let u = 1, i = 1, o = 1;
EventDispatcher.listenToEvent('keydown', (/**@type {KeyboardEvent}*/ keyEvent) => {
  if (keyEvent.key === 'Escape') {
    GameState.setPaused(!GameState.paused);
  } else if (keyEvent.key === 'u') {
    simplexTestShapeA.geometry = geometries[u++];
    if (u === geometries.length) u -= geometries.length;
  } else if (keyEvent.key === 'i') {
    simplexTestShapeB.geometry = geometries[i++];
    if (i === geometries.length) i -= geometries.length;
  } else if (keyEvent.key === 'o') {
    supportTestShape.geometry = geometries[o++];
    if (o === geometries.length) o -= geometries.length;
  } else if (keyEvent.key === 'j') {
    if (SimplexTester.nextStage === 0) {
      SimplexTester.shapeA.localTransform.orientation = Quaternion.random().normalized();
      const offset = 1.2 * Math.random();
      SimplexTester.shapeA.localTransform.position = new Vector3(offset, 0, 0);
      SimplexTester.shapeB.localTransform.orientation = Quaternion.random().normalized();
      SimplexTester.shapeB.localTransform.position = new Vector3(-0.5, 0, 0);
    }
    SimplexTester.runSimplexTest();
  } else if (keyEvent.key === 'k') {
    SupportTester.runSupportTest();
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
  GameState.dt = GameState.paused ? 0 : dt;

  ScriptProcess.earlyUpdate(GameState.dt);

  PlayerProcess.update(playerController, dt); // Player process ignores game pause state

  DraggableProcess.update();

  PhysicsProcess.step(GameState.dt);
  PhysicsProcess.update();

  ScriptProcess.update(GameState.dt);

  MeshRenderingProcess.update();

  DebugProcess.beforeRender();
  ScriptProcess.lateUpdate(GameState.dt);
  renderer.render(scene, camera);
  DebugProcess.afterRender(GameState.dt);
});
TickProcess.setTickDuration(16);
TickProcess.start();