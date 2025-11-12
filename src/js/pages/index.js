import { Bird } from "../class/bird.js";
import tickManager from "../tick-manager.js";

const bird = new Bird();

const ctx = canvas.getContext('2d');
ctx.imageSmoothingEnabled = false;

tickManager.setCallback((dt) => {
  bird.update(dt);
  bird.draw(ctx);
});

window.addEventListener('focus', () => {
  tickManager.start();
});

window.addEventListener('blur', () => {
  tickManager.pause();
});

window.addEventListener('resize', () => {
  canvas.setAttribute('width', window.innerWidth.toString());
  canvas.setAttribute('height', window.innerHeight.toString());
});