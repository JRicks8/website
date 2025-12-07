import { Bird } from "../class/bird.js";
import { PhysicsWorld } from "../physics/physics-world.js";
import tickManager from "../tick-manager.js";

// Window state init

/** @type {HTMLCanvasElement} */
// @ts-ignore
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

// threejs init
// const camera = new PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 10);
// camera.position.z = 1;

// const scene = new Scene();

// const geometry = new BoxGeometry(0.2, 0.2, 0.2);
// const material = new MeshNormalMaterial();

// const mesh = new Mesh(geometry, material);

// scene.add(mesh);

// const renderer = new WebGLRenderer();
// renderer.setSize(window.innerWidth, window.innerHeight);
// renderer.setAnimationLoop(animate);
// document.body.appendChild(renderer.domElement);

// function animate(time) {
//   mesh.rotation.x = time / 2000;
//   mesh.rotation.y = time / 1000;
//   renderer.render(scene, camera);
// }

// Game state init
tickManager.start();

// Manage events
window.addEventListener('focus', () => {
  tickManager.start();
});

window.addEventListener('blur', () => {
  tickManager.pause();
});

function resizeCanvas() {
  canvas.setAttribute('width', window.innerWidth.toString());
  canvas.setAttribute('height', window.innerHeight.toString());
  ctx.imageSmoothingEnabled = false;
}

window.addEventListener('resize', () => {
  resizeCanvas();
  // resizeRenderView(renderer, camera, window.innerWidth, window.innerHeight);
});
// resizeRenderView(renderer, camera, window.innerWidth, window.innerHeight);
resizeCanvas();

// // Game Init
const bird1 = new Bird();
bird1.rigidbodyComponent.position.x = canvas.width * 0.33;
bird1.rigidbodyComponent.position.y = 100;
const bird2 = new Bird();
bird2.rigidbodyComponent.position.x = canvas.width * 0.66;
bird2.rigidbodyComponent.position.y = 100;

const world = new PhysicsWorld();
world.rigidbodies.push(bird1.rigidbodyComponent, bird2.rigidbodyComponent);

tickManager.setCallback((dt) => {
  world.step(dt);

  bird1.update(dt);
  bird2.update(dt); 

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  bird1.draw(ctx);
  bird2.draw(ctx);
});
