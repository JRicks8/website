import { BoxGeometry, Color, Mesh, MeshBasicMaterial, Quaternion as ThreeQuaternion } from "three";
import { getPointsFromGeometry } from "../../util/three-utils.js";
import { addToSimplex, computeSupportVector, testSimplex } from "../narrow-phase/gjk.js";
import { Quaternion } from "../../math/quaternion.js";
import { Vector3 } from "../../math/vector3.js";
import { GameState } from "../../game/game-state.js";
import { DebugProcess } from "../../processes/debug-process.js";
import { Matrix3x3 } from "../../math/matrix3x3.js";

/** @import {Simplex} from "../narrow-phase/gjk.js" */
/** @import {SupportVector} from "../narrow-phase/gjk.js" */

/**
 * @param {string} stage 
 * @param  {...string} args 
 */
function printState(stage, ...args) {
  DebugProcess.clearLog();
  DebugProcess.println(
    `Simplex Test
    PRESS J TO ADVANCE
    Stage: ${stage}`);
  DebugProcess.print(...args);
}

export const SimplexTester = {
  nextStage: 0,

  // Shapes to test
  shapeA: {
    geometry: new BoxGeometry(1, 1, 1, 1, 1, 1),
    localTransform: {
      orientation: new Quaternion(),
      position: new Vector3(1, 0, 0)
    },
  },
  shapeB: {
    geometry: new BoxGeometry(1, 1, 1, 1, 1, 1),
    localTransform: {
      orientation: new Quaternion(),
      position: new Vector3(-1, 0, 0)
    },
  },

  /** @type {Simplex} */
  simplex: null,
  /** @type {Vector3[]} */
  pointsA: null,
  /** @type {Matrix3x3} */
  matA: null,
  /** @type {Vector3[]} */
  pointsB: null,
  /** @type {Matrix3x3} */
  matB: null,
  /** @type {Vector3} */
  dir: null,
  /** @type {SupportVector} */
  last: null,
  status: -1,
  maxIt: 1000,
  it: 0,

  /** @returns {string} */
  getShapesSummary: () => {
    return `
    -------------Legend---------------
    white point : origin     
    green       : shape A sup
    blue        : shape B sup
    red         : simplex    
    -------------Shapes---------------
    Shape A
    Shape: ${SimplexTester.shapeA.geometry.type.replace('Geometry', '')}
    Position: ${SimplexTester.shapeA.localTransform.position.toString()}
    Orientation: ${SimplexTester.shapeA.localTransform.orientation.toString()}

    Shape B
    Shape: ${SimplexTester.shapeB.geometry.type.replace('Geometry', '')}
    Position: ${SimplexTester.shapeB.localTransform.position.toString()}
    Orientation: ${SimplexTester.shapeB.localTransform.orientation.toString()}
    `;
  },

  /** @returns {string} */
  getSimplexSummary: () => {
    let msg = `
    -------------Simplex---------------
    last dir: ${SimplexTester.dir.toString()}
    point sets: ${SimplexTester.simplex.points.length}
    `;
    for (let i = 0; i < SimplexTester.simplex.points.length; i++) {
      const v = SimplexTester.simplex.points[i];
      msg += `Support vector ${i}
        A--${v.supA.toString()}
        B--${v.supB.toString()}
        minkowski--${v.supMinkowski.toString()}
        `;
    }
    return msg;
  },

  /** @returns {string} */
  getFinalSummary: () => {
    let verdict;
    const status = SimplexTester.status;
    if (status === -1) {
      verdict = 'NO COLLISION';
    } else {
      verdict = 'COLLIDING';
    }
    return `
    -------------Summary---------------
    verdict: ${verdict}`
  },

  drawShapes: () => {
    const meshA = new Mesh(SimplexTester.shapeA.geometry, new MeshBasicMaterial({ wireframe: true }));
    meshA.setRotationFromQuaternion(new ThreeQuaternion(
      SimplexTester.shapeA.localTransform.orientation.x,
      SimplexTester.shapeA.localTransform.orientation.y,
      SimplexTester.shapeA.localTransform.orientation.z,
      SimplexTester.shapeA.localTransform.orientation.w));
    let position = SimplexTester.shapeA.localTransform.position.getCopy();
    meshA.position.set(position.x, position.y, position.z);
    DebugProcess.drawShape(meshA, 0.001, true);

    const meshB = new Mesh(SimplexTester.shapeB.geometry, new MeshBasicMaterial({ wireframe: true }));
    meshB.setRotationFromQuaternion(new ThreeQuaternion(
      SimplexTester.shapeB.localTransform.orientation.x,
      SimplexTester.shapeB.localTransform.orientation.y,
      SimplexTester.shapeB.localTransform.orientation.z,
      SimplexTester.shapeB.localTransform.orientation.w));
    position = SimplexTester.shapeB.localTransform.position.getCopy();
    meshB.position.set(position.x, position.y, position.z);
    DebugProcess.drawShape(meshB, 0.001, true);
  },

  drawSimplex: () => {
    const simplex = SimplexTester.simplex;
    const pointsA = [];
    const pointsB = [];
    const pointsMinkowski = [];
    for (let i = 0; i < simplex.points.length; i++) {
      pointsA.push(simplex.points[i].supA);
      pointsB.push(simplex.points[i].supB);
      pointsMinkowski.push(simplex.points[i].supMinkowski);
    }
    DebugProcess.drawPoints({ points: pointsA, color: new Color(0x00ff00) });
    DebugProcess.drawPoints({ points: pointsB, color: new Color(0x0080ff) });
    DebugProcess.drawPoints({ points: pointsMinkowski, color: new Color(0xff0000) });
    DebugProcess.drawWireframe({ points: pointsA, color: new Color(0x00ff00) });
    DebugProcess.drawWireframe({ points: pointsB, color: new Color(0x0080ff) });
    DebugProcess.drawWireframe({ points: pointsMinkowski, color: new Color(0xff0000) });
    // draw origin as well
    DebugProcess.drawPoints({ points: [new Vector3()], size: 10 });
  },

  stages: [
    () => { // Initialize
      DebugProcess.clearAll();
      SimplexTester.drawShapes();
      printState('Initialize (1/4)', SimplexTester.getShapesSummary());
    },
    () => { // First Support Vector
      /** @type {Simplex} */
      SimplexTester.simplex = {
        points: [],
        last: -1
      };

      SimplexTester.pointsA = getPointsFromGeometry(SimplexTester.shapeA.geometry);
      SimplexTester.matA = Quaternion.toMatrix(SimplexTester.shapeA.localTransform.orientation);

      SimplexTester.pointsB = getPointsFromGeometry(SimplexTester.shapeB.geometry);
      SimplexTester.matB = Quaternion.toMatrix(SimplexTester.shapeB.localTransform.orientation);

      SimplexTester.dir = Vector3.right();
      SimplexTester.last = computeSupportVector(
        SimplexTester.shapeA.localTransform.position, SimplexTester.matA, SimplexTester.pointsA, 
        SimplexTester.shapeB.localTransform.position, SimplexTester.matB, SimplexTester.pointsB, SimplexTester.dir);

      addToSimplex(SimplexTester.simplex, SimplexTester.last);

      SimplexTester.dir = SimplexTester.last.supMinkowski.getCopy().multiply(-1);

      DebugProcess.clearAll();
      SimplexTester.drawShapes();
      SimplexTester.drawSimplex();
      printState('First Support Vector (2/4)', SimplexTester.getShapesSummary(), SimplexTester.getSimplexSummary());
    },
    () => { // Iterative Simplex Test
      if (SimplexTester.it >= SimplexTester.maxIt) {
        return;
      }
      DebugProcess.clearAll();
      let shouldContinue = true;

      SimplexTester.last = computeSupportVector(
        SimplexTester.shapeA.localTransform.position, SimplexTester.matA, SimplexTester.pointsA,
        SimplexTester.shapeB.localTransform.position, SimplexTester.matB, SimplexTester.pointsB, SimplexTester.dir);
      
      // If farthest point on Minkowski diff on dir is before the origin,
      // no intersection is happening
      const delta = Vector3.dot(SimplexTester.last.supMinkowski, SimplexTester.dir);
      if (delta < 0) {
        SimplexTester.status = -1;
        shouldContinue = false;
      } else {
        addToSimplex(SimplexTester.simplex, SimplexTester.last);

        const simplexOut = testSimplex(SimplexTester.simplex, SimplexTester.dir);

        if (simplexOut === 1) {
          SimplexTester.status = 0;
          shouldContinue = false;
        } else if (simplexOut === -1) {
          SimplexTester.status = -1;
          shouldContinue = false;
        }
      }

      SimplexTester.drawShapes();
      SimplexTester.drawSimplex();
      printState('Iterative Simplex Test (3/4, Looped)', SimplexTester.getShapesSummary(), SimplexTester.getSimplexSummary());

      if (shouldContinue) SimplexTester.nextStage--;
      SimplexTester.it++;
    },
    () => { // Complete
      printState('Complete (4/4)', SimplexTester.getShapesSummary(), SimplexTester.getSimplexSummary(), SimplexTester.getFinalSummary());
    }
  ],

  runSimplexTest: () => {
    GameState.setPaused(true);

    if (SimplexTester.nextStage >= SimplexTester.stages.length) {
      DebugProcess.clearAll();
      GameState.setPaused(false);
      SimplexTester.reset();
    } else {
      SimplexTester.stages[SimplexTester.nextStage++]();
    }
  },
  
  reset: () => {
    DebugProcess.clearLog();
    SimplexTester.nextStage = 0;
    SimplexTester.simplex = null;
    SimplexTester.pointsA = null;
    SimplexTester.matA = null;
    SimplexTester.pointsB = null;
    SimplexTester.matB = null;
    SimplexTester.dir = null;
    SimplexTester.last = null;
    SimplexTester.maxIt = 1000;
    SimplexTester.it = 0;
  }
}