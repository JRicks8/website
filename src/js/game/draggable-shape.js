import { Box3, BoxGeometry, BufferGeometry, Color, Material, Mesh, MeshPhongMaterial, Raycaster, Quaternion as ThreeQuaternion, Vector3 as ThreeV3, Vector2 as ThreeV2 } from "three";
import { GameObject } from "./game-object.js";
import { RigidbodyComponent } from "../physics/rigidbody.js";
import eventDispatcher from "../event-dispatcher.js";
import gameState from "./game-state.js";
import { getMouseCoordsFromPixel } from "../util/three-utils.js";
import { Vector3 } from "../math/vector3.js";

export class DraggableShape extends GameObject {
  /** 
   * @private
   * @type {Mesh} 
   */
  _mesh;

  get mesh() {
    return this._mesh;
  }

  /** @private @type {number} */
  _objectClickedListener;
  /** @private @type {number} */
  _wheelListener;

  /** @private */
  _scrollPosition = 0;

  dragged = false;
  dragStartDistance = 0;

  /** @type {RigidbodyComponent} */
  rigidbodyComponent;
  
  /**
   * @param {BufferGeometry} geometry 
   * @param {Material} material 
   */
  constructor(geometry = new BoxGeometry(), material = new MeshPhongMaterial({ color: new Color(0, 0.5, 1) })) {
    super();
    this.rigidbodyComponent = this.addComponent(new RigidbodyComponent());
    this.rigidbodyComponent.collider.setGeometry(geometry);

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
        (desiredPos.x - this.position.x) * speed,
        (desiredPos.y - this.position.y) * speed,
        (desiredPos.z - this.position.z) * speed
      );
    }

    this.components.forEach(comp => comp.update(dt));

    this._mesh.position.set(this.position.x, this.position.y, this.position.z);
    this._mesh.setRotationFromQuaternion(new ThreeQuaternion(this.orientation.x, this.orientation.y, this.orientation.z, this.orientation.w));
  }

  /**
   * When the mouse is pressed down and a raycast is made and intersects
   * with an object, this is invoked
   * @param {import("three").Intersection} intersection 
   */
  onMouseDownRaycast(intersection) {
    if (this._mesh === intersection.object) {
      this.dragged = true;
      this.rigidbodyComponent.noForces = true;
      this.dragStartDistance = Math.max(intersection.object.position.distanceTo(gameState.mainCamera.position), 0.5);

      this._wheelListener = eventDispatcher.listenToEvent('wheel', (wheelEvent) => {
        this.dragStartDistance -= wheelEvent.deltaY / 1000;
      });

      const mouseUpListener = eventDispatcher.listenToEvent('mouseup', () => {
        this.dragged = false;
        this.rigidbodyComponent.noForces = false;
        eventDispatcher.stopListening('mouseup', mouseUpListener);
        eventDispatcher.stopListening('wheel', this._wheelListener);
      });
    }
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
  }
}