import { Bird } from "../class/bird.js";
import { PhysicsWorld } from "../physics/physics-world.js";
import tickManager from "../tick-manager.js";
import { resizeRenderView } from "../util/three-utils.js";

import bird_idle from "../../assets/bird/idle/bird_idle_0.png";
import { BoxGeometry, Mesh, MeshNormalMaterial, PerspectiveCamera, Scene, WebGLRenderer } from "three";

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

// // Game Init
const bird = new Bird();
bird.sprite.scale.set(0.2, 0.2, 0.2);
bird.addToScene(scene);

const world = new PhysicsWorld();
world.rigidbodies.push(bird.rigidbodyComponent);

tickManager.setCallback((dt) => {
  world.step(dt);

  bird.update(dt);

  renderer.render(scene, camera);
});
