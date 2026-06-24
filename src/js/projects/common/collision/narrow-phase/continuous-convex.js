import { BufferGeometry } from "three";
import { GJK } from "./gjk.js";

/** @import {Transform} from "../../components/transform.js" */

export const ContinuousConvexSolver = {
  /**
   * @param {{
   *   fromA: Transform,
   *   toA: Transform,
   *   geoA: BufferGeometry,
   *   fromB: Transform,
   *   toB: Transform,
   *   geoB: BufferGeometry
   * }} input
   */
  findTimeOfIntersection(input) {
    // Obtain bounding radius

    // Obtain velocities (must be linear)
    // Also find the projected maximum angular velocity
    // Also the relative linear velocity (B - A)

    // If the mag of the relative velocity + projected max ang vel is zero, collision is not possible (return)

    // Find the closest pair points between the two 

    // If the projected lin vel + max ang proj vel is <= Number.EPSILON there is no collision
    // This is because the closest points are very close but not touching

    // Outside loop: track value lambda & lastLambda
    // Begin a while loop: distance between points (dist) > some small search radius
      // Optional: debug draw a point here at the middle of the two points

      // Add to lambda: dist / (proj lin vel + max ang proj vel)
      // Check lambda for failure state: 0 < lambda < 1 OR lambda <= lastLambda

      // Get interpolated position & orientation using lambda
      
      // Compute closest points
      GJK.getClosestPoints(interpA, interpB, input.geoA, input.geoB);

      // Update externally tracked values

      // increment iterations

    // Return found midpoint between two points
  }
}