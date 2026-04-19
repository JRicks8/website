import { BoxGeometry, Mesh, MeshBasicMaterial } from "three";
import { Entity } from "../../common/class/entity.js";
import { MeshRendererComponent } from "../../common/components/mesh-renderer.js";
import { TransformComponent } from "../../common/components/transform.js";
import { RigidbodyComponent } from "../../common/components/rigidbody.js";
import { DraggableComponent } from "../../common/components/draggable-body.js";
import { MeshNormalMaterial } from "three";
import { ComponentManager } from "../../common/game/component-manager.js";
import { COLLIDER_BOX, ColliderComponent } from "../../common/components/collider.js";

/**
 * Creates a new entity with all of the configurations needed to make a draggable simulated body
 * @param {number} id 
 * @returns {Entity}
 */
export function buildDraggableBody(id) {
  const e = new Entity(id);
  ComponentManager.addComponent(e, new TransformComponent());

  const collider = ComponentManager.addComponent(e, new ColliderComponent());
  collider.colliderType = COLLIDER_BOX;
  collider.colliderMesh = new Mesh(new BoxGeometry(), new MeshBasicMaterial({ wireframe: true }));

  ComponentManager.addComponent(e, new RigidbodyComponent());
  ComponentManager.addComponent(e, new DraggableComponent());

  const mesh = new Mesh(new BoxGeometry(), new MeshNormalMaterial());
  ComponentManager.addComponent(e, new MeshRendererComponent(mesh));

  return e;
}