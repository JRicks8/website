import { Bird } from "../class/bird.js";
import { PhysicsWorld } from "../physics/physics-world.js";
import tickManager from "../tick-manager.js";

// Window state init

/** @type {HTMLCanvasElement} */
// @ts-ignore
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

window.addEventListener('focus', () => {
  tickManager.start();
});

window.addEventListener('blur', () => {
  tickManager.pause();
});

function resizeScreen() {
  canvas.setAttribute('width', window.innerWidth.toString());
  canvas.setAttribute('height', window.innerHeight.toString());
  ctx.imageSmoothingEnabled = false;
}

window.addEventListener('resize', resizeScreen);
resizeScreen();

// Game Init

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
