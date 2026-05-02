import { Mesh, MeshNormalMaterial } from "three";
import { ColliderComponent } from "./collider.js";
import { ConvexGeometry } from "three/examples/jsm/Addons.js";

export const COLLIDER_CONVEX = 'ConvexCollider';

export class ConvexColliderComponent extends ColliderComponent {
  colliderType = COLLIDER_CONVEX;
  geometry = new ConvexGeometry();
  colliderMesh = new Mesh(this.geometry, new MeshNormalMaterial({ wireframe: true }));
}