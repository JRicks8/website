import { BoxGeometry, Mesh, MeshBasicMaterial, Scene, SphereGeometry } from "three";
import { Entity } from "../../common/class/entity.js";
import { MeshRendererComponent } from "../../common/components/mesh-renderer.js";
import { RigidbodyComponent } from "../../common/components/rigidbody.js";
import { DraggableComponent } from "../../common/components/draggable-body.js";
import { MeshNormalMaterial } from "three";
import { ComponentManager } from "../../common/game/component-manager.js";
import { SphereColliderComponent } from "../../common/components/collider/sphere-collider.js";

/**
 * Creates a new entity with all of the configurations needed to make a draggable simulated body
 * @param {number} id 
 * @optional @param {Scene | undefined} scene 
 * @returns {Entity}
 */
export function buildDraggableBody(id, scene = undefined) {
  const e = new Entity(id);

  const collider = ComponentManager.addComponent(e, new SphereColliderComponent());
  scene?.add(collider.colliderMesh);

  ComponentManager.addComponent(e, new RigidbodyComponent());
  ComponentManager.addComponent(e, new DraggableComponent());

  const mesh = new Mesh(new SphereGeometry(), new MeshNormalMaterial());
  const meshRenderer = ComponentManager.addComponent(e, new MeshRendererComponent(mesh));
  scene?.add(meshRenderer.mesh);

  return e;
}