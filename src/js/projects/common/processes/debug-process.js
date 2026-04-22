import { BufferAttribute, BufferGeometry, Color, Material, Mesh, Object3D, Points, PointsMaterial, Scene } from "three";

/** 
 * @typedef DebugShape
 * @property {Object3D} object
 * @property {number} lifespan
 */

/**
 * @typedef Config
 * @property {import("../math/vector3.js").Vector3Like} position
 * @property {number} [lifespan] Defaults to 0 (draw for one frame)
 * @property {number} [size] Defaults to 10 pixels
 * @property {Color} [color] Defaults to white
 * @property {boolean} [attenuation] Defaults to false
 */

/** @type {Scene} */
let _scene;

/** @type {DebugShape[]} */
let _shapes = [];

export const DebugProcess = {
  /** @param {Scene} scene */
  initialize: (scene) => {
    _scene = scene;
  },

  /** @param {Config} config */
  drawPoint: (config) => {
    const dotGeometry = new BufferGeometry();
    dotGeometry.setAttribute('position', new BufferAttribute(new Float32Array([config.position.x, config.position.y, config.position.z]), 3));
    const dotMaterial = new PointsMaterial({ 
      size: config.size ?? 10, 
      color: config.color ?? new Color(0xffffff), 
      sizeAttenuation: config.attenuation ?? false 
    });
    const point = new Points(dotGeometry, dotMaterial);
    if (config.attenuation) {
      point.renderOrder = 999;
      dotMaterial.depthTest = false;
      dotMaterial.depthWrite = false;
    }
    _scene.add(point);
    _shapes.push({
      object: point,
      lifespan: config.lifespan ?? 0
    });
  },

  /**
   * @param {Mesh} mesh 
   * @param {number} lifespan 
   */
  drawShape: (mesh, lifespan = 1, alwaysOnTop = false) => {
    if (alwaysOnTop) {
      mesh.renderOrder = 999;
      mesh.material.depthTest = false;
      mesh.material.depthWrite = false;
    }
    _scene.add(mesh);
    _shapes.push({
      object: mesh,
      lifespan: lifespan
    });
  },

  beforeRender: () => {},

  /** @param {number} dt */
  afterRender: (dt) => {
    const keep = [];
    for (const shape of _shapes) {
      shape.lifespan -= dt;
      if (shape.lifespan <= 0) {
        _scene.remove(shape.object);
        continue;
      }
      keep.push(shape);
    }
    _shapes = keep;
  }
};