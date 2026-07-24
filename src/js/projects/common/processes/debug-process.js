import { BufferAttribute, BufferGeometry, Color, Line, LineBasicMaterial, LineDashedMaterial, Material, Mesh, MeshBasicMaterial, Object3D, Points, PointsMaterial, Scene, Vector3 as ThreeV3 } from "three";
import { LAYER_IGNORE_ALL } from "../util/layers.js";
import { GameState } from "../game/game-state.js";

/** @import { Vector3Like } from "../math/vector3.js" */

/** 
 * @typedef DebugShape
 * @property {Object3D} object
 * @property {number} lifespan
 */

/**
 * @typedef Config
 * @property {Vector3Like[]} points
 * @property {number} [lifespan] Defaults to 0 (draw for one frame)
 * @property {number} [size] Defaults to 10 pixels
 * @property {Color} [color] Defaults to white
 * @property {boolean} [attenuation] Defaults to false
 * @property {boolean} [dashed] Defaults to false
 */

/** @type {Scene} */
let _scene;

/** @type {DebugShape[]} */
let _shapes = [];

const logElement = document.getElementById('debugLog');

export const DebugProcess = {
  /** @param {Scene} scene */
  initialize: (scene) => {
    _scene = scene;
  },

  beforeRender: () => {},

  /** @param {number} dt */
  afterRender: (dt) => {
    const keep = [];
    for (const shape of _shapes) {
      if (!GameState.paused) shape.lifespan -= dt;
      if (shape.lifespan <= 0) {
        _scene.remove(shape.object);
        continue;
      }
      keep.push(shape);
    }
    _shapes = keep;
  },

  clearAll: () => {
    for (const shape of _shapes) {
      _scene.remove(shape.object);
    }
    _shapes = [];
  },

  /** @param {Config} config */
  drawPoints: (config) => {
    const dotGeometry = new BufferGeometry();
    const points = [];
    for (const point of config.points) {
      points.push(point.x, point.y, point.z);
    }
    dotGeometry.setAttribute('position', new BufferAttribute(new Float32Array(points), 3));
    const dotMaterial = new PointsMaterial({ 
      size: config.size ?? 10, 
      color: config.color ?? new Color(0xffffff), 
      sizeAttenuation: config.attenuation ?? false 
    });
    const pointsObject = new Points(dotGeometry, dotMaterial);
    pointsObject.layers.set(LAYER_IGNORE_ALL);
    if (config.attenuation) {
      pointsObject.renderOrder = 999;
      dotMaterial.depthTest = false;
      dotMaterial.depthWrite = false;
    }
    _scene.add(pointsObject);
    _shapes.push({
      object: pointsObject,
      lifespan: config.lifespan ?? 0.001
    });
  },

  /** @param {Config} config */
  drawWireframe: (config) => {
    for (let i = 0; i < config.points.length; i++) {
      for (let j = i + 1; j < config.points.length; j++) {
        DebugProcess.drawLine({
          ...config,
          points: [config.points[i], config.points[j]]
        });
      }
    }
  },

  /** @param {Config} config */
  drawLine: (config) => {
    const lineGeometry = new BufferGeometry();
    const linePoints = config.points.map(linePoint => new ThreeV3(linePoint.x, linePoint.y, linePoint.z));
    lineGeometry.setFromPoints(linePoints);
    let mat;
    if (config.dashed) {
      mat = new LineDashedMaterial({
        color: config.color ?? new Color(0xffffff),
        linewidth: config.size ?? 1,
        scale: config.size ?? 1,
        dashSize: 3,
        gapSize: 1
      });
    } else {
      mat = new LineBasicMaterial({
        color: config.color ?? new Color(0xffffff),
        linewidth: config.size ?? 1,
        linecap: 'round',
        linejoin: 'round'
      });
    }
    const lineObject = new Line(lineGeometry, mat);
    _scene.add(lineObject);
    _shapes.push({
      object: lineObject,
      lifespan: config.lifespan ?? 0.001
    });
  },

  /**
   * @param {Mesh} mesh 
   * @param {number} lifespan 
   */
  drawShape: (mesh, lifespan = 0, alwaysOnTop = false) => {
    if (alwaysOnTop) {
      mesh.renderOrder = 999;
      mesh.material.depthTest = false; // ignore errors here
      mesh.material.depthWrite = false;
    }
    _scene.add(mesh);
    _shapes.push({
      object: mesh,
      lifespan: lifespan
    });
  },

  /**
   * Writes the content to the debug log (with newline)
   * @param  {...any} args 
   */
  print: (...args) => {
    logElement.innerText += args.map(arg => String(arg)).join(' ');
  },

  /**
   * Writes the content to the debug log (with newline)
   * @param  {...any} args 
   */
  println: (...args) => {
    logElement.innerText += args.map(arg => String(arg)).join(' ') + '\n';
  },

  clearLog: () => {
    logElement.innerText = '';
  }
};