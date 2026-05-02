import { BoxGeometry, Mesh, MeshNormalMaterial, SphereGeometry } from "three";
import { ColliderComponent } from "./collider.js";

export const COLLIDER_BOX = 'BoxCollider';

export class BoxColliderComponent extends ColliderComponent {
  colliderType = COLLIDER_BOX;
  geometry = new BoxGeometry();
  colliderMesh = new Mesh(this.geometry, new MeshNormalMaterial({ wireframe: true }));
}