import { BoxGeometry, BufferGeometry, Mesh, MeshBasicMaterial } from "three";
import { Vector3 } from "../math/vector3.js";
import { RigidbodyComponent } from "../game/components/rigidbody.js";

export const COLLIDER_BOX = 'BoxCollider';
export const COLLIDER_SPHERE = 'SphereCollider';
export const CONVEX_POLYHEDRON = 'ConvexPolyhedron';
export const CONCAVE_POLYHEDRON = 'ConcavePolyhedron';

export class Collider {
  /** @type {RigidbodyComponent} */
  parent;
  /** @type {string} */
  colliderType;
  offset = new Vector3();
  
  /** @private @type {BufferGeometry} */
  _geometry;
  /** @private @type {Mesh} */
  _colliderMesh;

  get mesh() {
    return this._colliderMesh;
  }

  /** @param {boolean} isVisible */
  set visible(isVisible) {
    this._colliderMesh.visible = isVisible;
  }

  /** @param {string} colliderType */
  constructor(colliderType = COLLIDER_BOX, geometry = new BoxGeometry()) {
    this.colliderType = colliderType;
    this._geometry = geometry;
    this._colliderMesh = new Mesh(this._geometry, new MeshBasicMaterial({ wireframe: true }));
  }

  /** 
   * Sets the geometry of this collider. This dictates the shape of this collider.
   * @param {BufferGeometry} geometry 
   */
  setGeometry(geometry) {
    this._geometry = geometry;
    this._colliderMesh.geometry = this._geometry;
    this._geometry.computeBoundingBox();
  }
}