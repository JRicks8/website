import { COLLIDER_BOX } from "../components/collider/box-collider.js";
import { COLLIDER_CONCAVE } from "../components/collider/concave-collider.js";
import { COLLIDER_CONVEX } from "../components/collider/convex-polyhedron-collider.js";
import { COLLIDER_SPHERE } from "../components/collider/sphere-collider.js";
import { boxToBox, boxToCav, boxToVex, cavToCav, sphToBox, sphToCav, sphToSph, sphToVex, vexToCav, vexToVex } from "./intersection-tests.js";

/** @type {{ [key: string]: number }} */
const COLLIDER_NAME_INDEX = {
  [COLLIDER_BOX]: 0, 
  [COLLIDER_SPHERE]: 1, 
  [COLLIDER_CONVEX]: 2,
  [COLLIDER_CONCAVE]: 3
};

const testImplMapper = [
      //    box       sph       vex       cav
/*box*/  [boxToBox, sphToBox, boxToVex, boxToCav],
/*sph*/  [sphToBox, sphToSph, sphToVex, sphToCav],
/*vex*/  [boxToVex, sphToVex, vexToVex, vexToCav],
/*cav*/  [boxToCav, sphToCav, vexToCav, cavToCav]
]

/**
 * Returns the appropriate intersection test method depending on the type of colliders.
 * @param {string} c1 
 * @param {string} c2 
 */
export function getIntersectionTest(c1, c2) {
  return testImplMapper[COLLIDER_NAME_INDEX[c1]][COLLIDER_NAME_INDEX[c2]];
}