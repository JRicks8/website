import { Box3, BoxGeometry, BufferGeometry, Color, Material, Mesh, MeshPhongMaterial, Raycaster, Quaternion as ThreeQuaternion, Vector3 as ThreeV3, Vector2 as ThreeV2 } from "three";
import gameState from "./game-state.js";
import { getMouseCoordsFromPixel } from "../util/three-utils.js";
import { Entity } from "../class/entity.js";
import { TransformComponent } from "../components/transform.js";
import { RigidbodyComponent } from "../components/rigidbody.js";

export class DraggableShape extends Entity {

  /** @private @type {number} */
  _objectClickedListener;
  /** @private @type {number} */
  _wheelListener;

  /** @private */
  _scrollPosition = 0;

  dragged = false;
  dragStartDistance = 0;

  /** @type {TransformComponent} */
  transform;
  /** @type {RigidbodyComponent} */
  rigidbodyComponent;
  
  /**
   * @param {BufferGeometry} geometry 
   * @param {Material} material 
   */
  constructor(geometry = new BoxGeometry(), material = new MeshPhongMaterial({ color: new Color(0, 0.5, 1) })) {
    super();
    this.transform = this.addComponent(new TransformComponent(this, null));

    this.rigidbodyComponent = this.addComponent(new RigidbodyComponent());
    this.rigidbodyComponent.colliderComponent.setGeometry(geometry);

    this._mesh = new Mesh(geometry, material);
    this._mesh.geometry.computeBoundingBox();
    
    this._objectClickedListener = eventDispatcher.listenToEvent('objectclicked', (intersection) => this.onMouseDownRaycast(intersection));
  }

  /** @param {number} dt */
  update(dt) {
    if (this.dragged) {
      const cameraUp = gameState.mainCamera.up
      const cameraRight = new ThreeV3(cameraUp.x, 0, cameraUp.z).normalize();
      cameraRight.cross(cameraUp).normalize();

      const coords = getMouseCoordsFromPixel(gameState.mousePosition.x, gameState.mousePosition.y);
      const dummyRaycaster = new Raycaster();
      dummyRaycaster.setFromCamera(new ThreeV2(...coords), gameState.mainCamera);
      const desiredPos = new Vector3(...dummyRaycaster.ray.direction);
      desiredPos.multiply(this.dragStartDistance);
      desiredPos.addv3(new Vector3(...gameState.mainCamera.position));

      const speed = 2;
      this.rigidbodyComponent.bodyState.velocity.set(
        (desiredPos.x - this.transform.position.x) * speed,
        (desiredPos.y - this.transform.position.y) * speed,
        (desiredPos.z - this.transform.position.z) * speed
      );
    }

    this._mesh.position.set(this.transform.position.x, this.transform.position.y, this.transform.position.z);
    this._mesh.setRotationFromQuaternion(new ThreeQuaternion(this.transform.orientation.x, this.transform.orientation.y, this.transform.orientation.z, this.transform.orientation.w));
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

  destroy() {
    eventDispatcher.stopListening('objectclicked', this._objectClickedListener);
    this.cleanup();
  }
}