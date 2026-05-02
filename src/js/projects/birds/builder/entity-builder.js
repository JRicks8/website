import { Scene } from "three";
import { Entity } from "../../common/class/entity.js";
import { MeshRendererComponent } from "../../common/components/mesh-renderer.js";
import { RigidbodyComponent } from "../../common/components/rigidbody.js";
import { DraggableComponent } from "../../common/components/draggable-body.js";
import { ComponentManager } from "../../common/game/component-manager.js";
import { Registry } from "../../common/game/register.js";
import { ColliderComponent } from "../../common/components/collider/collider.js";

export function entityBuilder() {
  const entity = new Entity(Registry.getUniqueId());
  const builder = {
    /** @param {number} id */
    id: (id) => {
      entity.id = id
      return builder;
    },

    /** @param {ColliderComponent} collider @param {Scene} [scene] */
    colliderComponent: (collider, scene = undefined) => {
      ComponentManager.addComponent(entity, collider);
      if (collider.colliderMesh && scene) scene.add(collider.colliderMesh);
      return builder;
    },

    /** @param {RigidbodyComponent} rigidbody */
    rigidbodyComponent: (rigidbody) => {
      ComponentManager.addComponent(entity, rigidbody)
      return builder;
    },

    /** @param {DraggableComponent} draggable */
    draggableComponent: (draggable) => {
      ComponentManager.addComponent(entity, draggable)
      return builder;
    },

    /** @param {MeshRendererComponent} meshRenderer @param {Scene} [scene] */
    meshRendererComponent: (meshRenderer, scene = undefined) => {
      ComponentManager.addComponent(entity, meshRenderer);
      if (meshRenderer.mesh && scene) scene.add(meshRenderer.mesh);
      return builder;
    },

    build: () => {
      Registry.register(entity, entity.id);
      return entity;
    }
  };
  return builder;
}