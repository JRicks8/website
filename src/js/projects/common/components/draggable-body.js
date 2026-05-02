import { ColliderComponent } from "./collider/collider.js";
import { Component } from "./class/component.js";

export const COMP_DRAGGABLE = 'Draggable';

export class DraggableComponent extends Component {
  /** @type {ColliderComponent | undefined} */
  colliderComponent;

  scrollPosition = 0;

  dragStartDistance = 0;
  dragged = false;

  constructor() {
    super(COMP_DRAGGABLE);
  }
}