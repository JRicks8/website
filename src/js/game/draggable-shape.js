import { Box3, BoxGeometry, BufferGeometry, Color, Material, Mesh, MeshPhongMaterial, Quaternion as ThreeQuaternion } from "three";
import { GameObject } from "./game-object.js";
import { RigidbodyComponent } from "../physics/rigidbody.js";

export class DraggableShape extends GameObject {
  /** 
   * @private
   * @type {Mesh} 
   */
  _mesh;

  get mesh() {
    return this._mesh;
  }

  /**
   * @param {BufferGeometry} geometry 
   * @param {Material} material 
   */
  constructor(geometry = new BoxGeometry(), material = new MeshPhongMaterial({ color: new Color(0, 0.5, 1) })) {
    super();
    const rb = this.addComponent(new RigidbodyComponent());
    rb.collider.setGeometry(geometry);

    this._mesh = new Mesh(geometry, material);
    this._mesh.geometry.computeBoundingBox();
  }

  /** @param {number} dt */
  update(dt) {
    this.components.forEach(comp => comp.update(dt));

    this._mesh.position.set(this.position.x, this.position.y, this.position.z);
    this._mesh.setRotationFromQuaternion(new ThreeQuaternion(this.orientation.x, this.orientation.y, this.orientation.z, this.orientation.w));
  }

  onMouseDown() {
  }

  onMouseUp() {
  }

  /**
   * Sets the geometry of this shape's mesh and recomputes the bounding box.
   * @param {BufferGeometry} geometry 
   */
  setGeometry(geometry) {
    this._mesh.geometry = geometry;
    this._mesh.geometry.computeBoundingBox();
  }

  /**
   * Sets the material of this shape's mesh.
   * @param {Material} material 
   */
  setMaterial(material) {
    this._mesh.material = material;
  }

  /** @returns {Box3} */
  getBoundingBox() {
    return this._mesh.geometry.boundingBox;
  }
}