import { BoxGeometry, Mesh, MeshNormalMaterial, PerspectiveCamera, Scene, WebGLRenderer } from "three";
import { PhysicsWorld } from "../physics/physics-world.js";
import tickManager from "../tick-manager.js";
import { resizeRenderView } from "../util/three-utils.js";
import { DraggableShape } from "../game/draggable-shape.js";
import { COMP_RIGIDBODY, RigidbodyComponent } from "../physics/rigidbody.js";

// threejs init
const camera = new PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 10);
camera.position.z = 1;

const scene = new Scene();

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
window.addEventListener('focus', () => {
  tickManager.start();
});

window.addEventListener('blur', () => {
  tickManager.pause();
});

window.addEventListener('resize', () => {
  resizeRenderView(renderer, camera, window.innerWidth, window.innerHeight);
});
resizeRenderView(renderer, camera, window.innerWidth, window.innerHeight);

// Game Init
const world = new PhysicsWorld();

const box = new DraggableShape(new BoxGeometry(0.2, 0.2, 0.2), new MeshNormalMaterial());
scene.add(box.mesh);
{
  /** @type {RigidbodyComponent} */
  const boxRb = box.getComponent(COMP_RIGIDBODY);
  boxRb.collider.visible = true;
  world.rigidbodies.push(boxRb);
  scene.add(boxRb.collider.mesh);
}

tickManager.setCallback((dt) => {
  console.log(dt);
  world.step(dt);

  box.update(dt);

  renderer.render(scene, camera);
});
