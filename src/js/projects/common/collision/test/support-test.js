import { BoxGeometry, Color, Mesh, MeshBasicMaterial, Quaternion as ThreeQuaternion } from "three";
import { Quaternion } from "../../math/quaternion.js";
import { Vector3 } from "../../math/vector3.js";
import { DebugProcess } from "../../processes/debug-process.js";
import { ScriptComponent } from "../../game/script.js";
import { clamp } from "../../math/common.js";
import { ScriptProcess } from "../../processes/script-process.js";
import { getLocalSupportPoint } from "../narrow-phase/gjk.js";
import { getPointsFromGeometry } from "../../util/three-utils.js";
import { applyTransform, applyTransform2 } from "../../util/transform-utils.js";
import { GameState } from "../../game/game-state.js";
import { Matrix3x3 } from "../../math/matrix3x3.js";

// Test the calculation of supporting points
export const SupportTester = {
  running: false,

  fromDir: new Quaternion(),
  toDir: new Quaternion(),
  orient: new Quaternion(),
  nextDirTimer: 5,
  timeBetweenAngles: 5,

  script: new ScriptComponent(),

  shape: {
    geometry: new BoxGeometry(1, 1, 1, 1, 1, 1),
    localTransform: {
      orientation: new Quaternion(),
      position: new Vector3(0, 0, 0)
    },
  },

  drawShape: () => {
    const mesh = new Mesh(SupportTester.shape.geometry, new MeshBasicMaterial({ wireframe: true }));
    mesh.setRotationFromQuaternion(new ThreeQuaternion(
      SupportTester.shape.localTransform.orientation.x,
      SupportTester.shape.localTransform.orientation.y,
      SupportTester.shape.localTransform.orientation.z,
      SupportTester.shape.localTransform.orientation.w
    ));
    let position = SupportTester.shape.localTransform.position.getCopy();
    mesh.position.set(position.x, position.y, position.z);
    DebugProcess.drawShape(mesh);

    const positionOffset = Vector3.add(SupportTester.shape.localTransform.position, new Vector3(2, 0, 0));
    const mesh2 = new Mesh(SupportTester.shape.geometry, new MeshBasicMaterial({ wireframe: true }));
    mesh2.position.set(positionOffset.x, positionOffset.y, positionOffset.z);
    DebugProcess.drawShape(mesh2);

    positionOffset.subtractv3(new Vector3(4, 0, 0));
    const mesh3 = new Mesh(SupportTester.shape.geometry, new MeshBasicMaterial({ wireframe: true }));
    mesh3.setRotationFromQuaternion(new ThreeQuaternion(
      SupportTester.orient.x,
      SupportTester.orient.y,
      SupportTester.orient.z,
      SupportTester.orient.w,
    ));
    mesh3.position.set(positionOffset.x, positionOffset.y, positionOffset.z);
    DebugProcess.drawShape(mesh3);
  },

  runSupportTest: () => {
    const wasRunning = SupportTester.running;
    SupportTester.running = !SupportTester.running;
    if (wasRunning) {
      DebugProcess.clearLog();
      ScriptProcess.remove(SupportTester.script);
    } else {
      SupportTester.fromDir = Quaternion.random();
      SupportTester.toDir = Quaternion.random();
      SupportTester.shape.localTransform.orientation = Quaternion.random();
      ScriptProcess.add(SupportTester.script);
    }
  }
}

/**
 * @param {Vector3[]} points 
 * @param {Vector3} position 
 * @param {Matrix3x3} mat 
 * @param {Vector3} dir 
 */
function getSupportPoint(points, position, mat, dir) {
  const localDir = Matrix3x3.multiplyVector3(mat.getCopy().transpose(), dir);

  const pointLocal = getLocalSupportPoint(localDir, points);

  const pointWorld = applyTransform2(pointLocal, position, mat);

  return pointWorld;
}

/** @param {number} dt */
SupportTester.script.update = (dt) => {
  SupportTester.nextDirTimer -= dt;
  if (SupportTester.nextDirTimer <= 0) {
    SupportTester.fromDir = SupportTester.toDir.getCopy();
    SupportTester.toDir = Quaternion.random();
    SupportTester.nextDirTimer = SupportTester.timeBetweenAngles;
  }

  const epsilon = clamp(SupportTester.nextDirTimer / SupportTester.timeBetweenAngles, 0, 1);
  SupportTester.orient = Quaternion.slerp(SupportTester.toDir, SupportTester.fromDir, epsilon).normalized();
  const shapeMat = Quaternion.toMatrix(SupportTester.shape.localTransform.orientation);
  const mat = Quaternion.toMatrix(SupportTester.orient);
  const toMat = Quaternion.toMatrix(SupportTester.toDir);
  const fromMat = Quaternion.toMatrix(SupportTester.fromDir);

  const dirV = Matrix3x3.multiplyVector3(mat, Vector3.forward());
  const toDirV = Matrix3x3.multiplyVector3(toMat, Vector3.forward());
  const fromDirV = Matrix3x3.multiplyVector3(fromMat, Vector3.forward());

  const localDir = Matrix3x3.multiplyVector3(shapeMat.getCopy().transpose(), dirV);
  const allPoints = getPointsFromGeometry(SupportTester.shape.geometry);

  const localPoint = getLocalSupportPoint(localDir, allPoints);
  const worldPoint = getSupportPoint(allPoints, SupportTester.shape.localTransform.position, shapeMat, dirV);

  if (!GameState.paused) {
    SupportTester.drawShape();
    DebugProcess.drawPoints({ points: [new Vector3(2, 0, 0).addv3(localPoint)], color: new Color(0xffff00), size: 20 });
    DebugProcess.drawPoints({ points: [worldPoint], color: new Color(0xffff00), size: 20 });
    DebugProcess.drawLine({
      points: [
        new Vector3(2, 0, 0),
        Vector3.add(new Vector3(2, 0, 0), localDir)
      ],
      color: new Color(0xffff00)
    });
    DebugProcess.drawLine({
      points: [
        SupportTester.shape.localTransform.position,
        Vector3.add(SupportTester.shape.localTransform.position, dirV)
      ],
      color: new Color(0xffff00)
    });
    DebugProcess.drawLine({
      points: [
        new Vector3(-2, 0, 0),
        Vector3.add(new Vector3(-2, 0, 0), dirV)
      ],
      color: new Color(0xffff00)
    });
    DebugProcess.drawLine({
      points: [
        SupportTester.shape.localTransform.position,
        Vector3.add(SupportTester.shape.localTransform.position, toDirV)
      ],
      color: new Color(0x00ff00)
    });
    DebugProcess.drawLine({
      points: [
        SupportTester.shape.localTransform.position,
        Vector3.add(SupportTester.shape.localTransform.position, fromDirV)
      ],
      color: new Color(0xff0000)
    });
  }

  DebugProcess.clearLog();
  DebugProcess.print(`----------------Support Point Test-----------------
    shape: ${SupportTester.shape.geometry.type.replace('Geometry', '')}
    from: ${SupportTester.fromDir.toString()}
    to: ${SupportTester.toDir.toString()}
    orient: ${SupportTester.orient.toString()}
    epsilon: ${Math.round(epsilon * 100)}%
    
    local point: ${localPoint.toString()}
    world point: ${worldPoint.toString()}`);
};