import { Camera } from "three";
import { Entity } from "../class/entity.js";
import { PlayerControllerComponent } from "../components/player-controller.js";
import { ComponentManager } from "../game/component-manager.js";

/**
 * Creates a new entity with all of the configurations needed to make a draggable simulated body
 * @param {number} id 
 * @param {Camera} camera 
 * @returns {Entity}
 */
export function buildFlyingFPController(id, camera) {
  const player = new Entity(id);

  const playerController = ComponentManager.addComponent(player, new PlayerControllerComponent());
  playerController.camera = camera;

  return player;
}