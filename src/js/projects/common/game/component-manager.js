import { Entity } from "../class/entity.js";
import { COMP_COLLIDER } from "../components/class/collider.js";
import { Component } from "../components/class/component.js";
import { COMP_DRAGGABLE, DraggableComponent } from "../components/draggable-body.js";
import { COMP_MESH_RENDERER, MeshRendererComponent } from "../components/mesh-renderer.js";
import { COMP_PLAYER_CONTROLLER } from "../components/player-controller.js";
import { COMP_RIGIDBODY, RigidbodyComponent } from "../components/rigidbody.js";
import { computeInertia } from "../util/physics-utils.js";
import { DraggableProcess } from "../processes/draggable-process.js";
import { MeshRenderingProcess } from "../processes/mesh-rendering-process.js";
import { PhysicsProcess } from "../processes/physics-process.js";
import { ScriptProcess } from "../processes/script-process.js";
import { Registry } from "./register.js";
import { COMP_SCRIPT } from "./script.js";

/**
 * The component manager is important for managing the lifetime of components.
 * Over the duration of the application, many components will be created and destroyed.
 * It's intended for each of those actions to be channeled through the component
 * manager, so that appropriate actions can be taken.
 * 
 * The component manager serves as the link between creating a component and adding
 * that component to a process' context.
 */

/** 
 * @typedef ComponentAction
 * @property {(component: any) => void} onAdd
 * @property {(component: any) => void} onRemove
 */

/** @type {{[componentType: string]: ComponentAction}} */
const _componentHandlers = {};

_componentHandlers[COMP_DRAGGABLE] = {
  /** @param {DraggableComponent} component */
  onAdd: (component) => {
    DraggableProcess.add(component);

    component.colliderComponent = ComponentManager.getComponent(component.entity, COMP_COLLIDER);
    if (!component.colliderComponent) {
      console.warn('Added draggable component to entity with no collider.');
    }
  },
  /** @param {DraggableComponent} component */
  onRemove: (component) => {
    DraggableProcess.remove(component);
  }
};

_componentHandlers[COMP_MESH_RENDERER] = {
  /** @param {MeshRendererComponent} component */
  onAdd: (component) => {
    MeshRenderingProcess.add(component);
  },
  /** @param {MeshRendererComponent} component */
  onRemove: (component) => {
    MeshRenderingProcess.remove(component);
  }
};

_componentHandlers[COMP_RIGIDBODY] = {
  /** @param {RigidbodyComponent} component */
  onAdd: (component) => {
    component.id = Registry.registerToContext(component, PhysicsProcess.registryContext, component.id);

    component.colliderComponent = ComponentManager.getComponent(component.entity, COMP_COLLIDER);
    if (!component.colliderComponent) {
      console.warn('Added rigidbody to entity with no collider.');
    }

    computeInertia(component);
    PhysicsProcess.add(component);
  },
  /** @param {RigidbodyComponent} component */
  onRemove: (component) => {
    Registry.deregisterFromContext(PhysicsProcess.registryContext, component.id);
    component.colliderComponent = undefined;
    PhysicsProcess.remove(component);
  }
};

_componentHandlers[COMP_SCRIPT] = {
  onAdd: (component) => {
    ScriptProcess.add(component);
    component.awake();
  },
  onRemove: (component) => {
    ScriptProcess.remove(component);
  }
};

/** @param {Component} component */
function added(component) {
  if (_componentHandlers[component.type]) 
    _componentHandlers[component.type].onAdd(component);
}

/** @param {Component} component */
function removed(component) {
  if (_componentHandlers[component.type]) 
    _componentHandlers[component.type].onRemove(component);
}

export const ComponentManager = {
  /**
   * Adds the specified component to the given entity.
   * @template T
   * @param {Entity} entity
   * @param {T & Component} component
   * @returns {T & Component} Returns the added component
   */
  addComponent: (entity, component) => {
    entity.components[component.type] ??= [];
    entity.components[component.type].push(component);
    component.entity = entity;
    added(component);
    return component;
  },

  /**
   * @param {?Entity} entity 
   * @param {Component} component
   * @returns {boolean} True if successfully removed, false if the component was not present.
   */
  removeComponent: (entity, component) => {
    const comps = entity?.components[component.type];
    if (comps) {
      const i = comps.findIndex(c => c === component);
      if (i >= 0) {
        comps.splice(i, 1)[0].entity = null;
        removed(component);
        return true;
      }
    }
    return false;
  },

  /**
   * @param {?Entity} entity 
   * @param {string} componentType
   * @returns {boolean} True if successfully removed, false if there was no component matching the type.
   */
  removeComponentOfType: (entity, componentType) => {
    const comps = entity?.components[componentType];
    if (comps && comps.length > 0) {
      const comp = comps.splice(0, 1)[0];
      comp.entity = null;
      removed(comp);
      return true;
    }
    return false;
  },

  /**
   * @param {?Entity} entity 
   * @param {?string} componentType
   * @returns {(any & Component) | undefined}
   */
  getComponent: (entity, componentType) => {
    if (componentType && entity) {
      return entity.components?.[componentType]?.[0];
    }
  },

  /**
   * @param {Entity} entity 
   * @param {string} componentType 
   * @returns {(any & Component)[]}
   */
  getComponents: (entity, componentType) => {
    return entity.components?.[componentType] || [];
  },

  /**
   * @param {Entity} entity 
   */
  removeAllComponents: (entity) => {
    Object.entries(entity.components).forEach(group => {
      group[1].forEach(comp => {
        comp.entity = null;
        removed(comp);
      });
    });
    entity.components = {};
  }
}