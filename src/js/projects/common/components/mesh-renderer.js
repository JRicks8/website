import { Mesh } from "three";
import { Component } from "./class/component.js";

export const COMP_MESH_RENDERER = 'MeshRenderer';

export class MeshRendererComponent extends Component {
  /** @type {Mesh} */
  mesh;

  /**
   * @param {Mesh} mesh 
   */
  constructor(mesh) {
    super(COMP_MESH_RENDERER);
    this.mesh = mesh;
  }
}