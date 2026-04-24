import { Mesh, MeshNormalMaterial, SphereGeometry } from "three";
import { ColliderComponent } from "../class/collider.js";

export const COLLIDER_SPHERE = 'SphereCollider';

export class SphereColliderComponent extends ColliderComponent {
  colliderType = COLLIDER_SPHERE;
  geometry = new SphereGeometry();
  colliderMesh = new Mesh(this.geometry, new MeshNormalMaterial({ wireframe: true }));
}