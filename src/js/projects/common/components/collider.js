import { BoxGeometry, BufferGeometry, Mesh, MeshBasicMaterial } from "three";
import { Vector3 } from "../math/vector3.js";
import { Component } from "./component.js";

export const COMP_COLLIDER = 'Collider';

export const COLLIDER_BOX = 'BoxCollider';
export const COLLIDER_SPHERE = 'SphereCollider';
export const COLLIDER_CONVEX_POLYHEDRON = 'ConvexPolyhedron';
export const COLLIDER_CONCAVE_POLYHEDRON = 'ConcavePolyhedron';

export class ColliderComponent extends Component {
  /** @type {string} */
  colliderType = COLLIDER_BOX;
  offset = new Vector3();
  
  /** @type {Mesh} */
  colliderMesh = new Mesh(new BoxGeometry(), new MeshBasicMaterial({ wireframe: true }));

  constructor() {
    super(COMP_COLLIDER);
  }
}