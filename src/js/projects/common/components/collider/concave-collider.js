import { BufferGeometry, Mesh, MeshNormalMaterial } from "three";
import { ColliderComponent } from "./collider.js";

export const COLLIDER_CONCAVE = 'ConcaveCollider';

export class ConcaveColliderComponent extends ColliderComponent {
  colliderType = COLLIDER_CONCAVE;
  geometry = new BufferGeometry();
  colliderMesh = new Mesh(this.geometry, new MeshNormalMaterial({ wireframe: true }));
}