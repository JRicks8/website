import { Quaternion as ThreeQuaternion } from "three";
import { MeshRendererComponent } from "../components/mesh-renderer.js";
import { COMP_TRANSFORM, TransformComponent } from "../components/transform.js";
import { ComponentManager } from "../game/component-manager.js";
import { LAYER_IGNORE_ALL } from "../util/layers.js";

/** @type {MeshRendererComponent[]} */
const _meshRenderers = []; 

export const MeshRenderingProcess = {
  /** @param {MeshRendererComponent} meshRenderer */
  add: (meshRenderer) => {
    meshRenderer.mesh.layers.set(LAYER_IGNORE_ALL);
    _meshRenderers.push(meshRenderer);
  },

  /** @param {MeshRendererComponent} meshRenderer */
  remove: (meshRenderer) => {
    _meshRenderers.splice(_meshRenderers.findIndex((m) => m === meshRenderer));
  },

  /**
   * Updates the provided mesh renderers such that the meshes they contain reflect the 
   * position of the entity they belong to.
   */
  update: () => {
    for (const renderer of _meshRenderers) {
      if (!renderer?.entity) continue;

      /** @type {TransformComponent} */
      const transform = ComponentManager.getComponent(renderer.entity, COMP_TRANSFORM);
      if (transform) {
        renderer.mesh.position.set(transform.position.x, transform.position.y, transform.position.z);
        renderer.mesh.setRotationFromQuaternion(new ThreeQuaternion(transform.orientation.x, transform.orientation.y, transform.orientation.z, transform.orientation.w));
      }
    }
  }
};