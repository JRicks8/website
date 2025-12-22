import { Vector3 } from "../math/vector3.js";
import { RigidbodyComponent } from "./rigidbody.js";

export class Contact {
  /** 
   * Contains Vertex
   * @type {RigidbodyComponent} 
   */
  a;

  /** 
   * Contains Face
   * @type {RigidbodyComponent} 
   */
  b;

  /** 
   * The point of collision
   * @type {Vector3} 
   */
  point;

  /** 
   * Outward facing normal of face
   * @type {Vector3} 
   */
  normal;

  /** 
   * Edge direction of A
   * @type {Vector3}
   */
  ea;

  /** 
   * Edge direction of B
   * @type {Vector3}
   */
  eb;

  /**
   * True if vertex/face contact
   * @type {Boolean}
   */
  vf;
}