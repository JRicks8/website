import { Matrix3x3 } from "../math/matrix3x3.js";
import { Quaternion } from "../math/quaternion.js";
import { Vector3 } from "../math/vector3.js";

export class BodyState {
  // Constant quantities
  mass = 1;
  
  iBodyInv = new Matrix3x3();

  // State variables
  position = new Vector3();
  orientation = new Quaternion();
  momentum = new Vector3();
  angularMomentum = new Vector3();

  // Derived quantities
  iInv = new Matrix3x3();
  rMatrix = new Matrix3x3();
  velocity = new Vector3();
  angularVelocity = new Vector3();

  // Computed quantities
  force = new Vector3();
  torque = new Vector3();
}