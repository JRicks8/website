/** 
 * @type {{[context: string]: {[id: number]: any}}} 
 */
const _contexts = {
  default: {}
};

let _currentContext = _contexts.default;
let _currentContextName = 'default';

let _idCounter = 0;

/**
 * Verifies the input id.  
 * If the id is not unique, this function will return a new valid id.
 * @param {?number} id
 * @returns {number}
 */
function verifyId(id) {
  if (!id && id !== 0) {
    while (_currentContext[_idCounter]) _idCounter++;
    return _idCounter;
  }
  return id;
}

/**
 * @param {?} item
 * @param {{[id: number]: any}} context
 * @param {?number} id
 * @returns {number} The id of the item, or null if the id is already assigned.
 */
function addToContext(item, context, id) {
  id = verifyId(id);
  context[id] = item;
  return id;
}

/**
 * The register is intended to be used as a retrieval, insertion, and deletion
 * manager for items with unique ids.
 */
export const Registry = {
  /**
   * Retrieves the name of the active context.
   * @returns {string}
   */
  getContext: () => {
    return _currentContextName;
  },

  /** 
   * Sets the context with the given name.
   * If the context does not exist, a new one will be created.
   * The 'default' context is always available.
   * @param {string} contextName
   */
  setContext: (contextName) => {
    _contexts[contextName] ??= {};
    _currentContext = _contexts[contextName];
    _currentContextName = contextName;
  },

  /**
   * Deletes the context with the given name. If the context being deleted is the current context,
   * the current context becomes the default context.
   * @param {string} contextName 
   * @returns {boolean} True if the context exists and was removed, otherwise returns false.
   */
  removeContext: (contextName) => {
    if (contextName === 'default') return false;
    if (_contexts[contextName] === _currentContext) {
      _currentContext = _contexts.default;
      _currentContextName = 'default';
    }
    return delete _contexts[contextName];
  },

  /**
   * Registers the provided item to the current context.
   * The id must not already belong to another item within that context.
   * @param {?} item
   * @param {?number} id
   * @returns {number} The id of the item, or null if the id is already assigned.
   */
  register: (item, id) => {
    id = verifyId(id);
    return addToContext(item, _currentContext, id);
  },

  /**
   * Registers the provided item to the specified context.
   * The id must not already belong to another item within that context.
   * @param {?} item
   * @param {string} contextName
   * @param {?number} id
   * @returns {number} The id of the item, or null if the id is already assigned.
   */
  registerToContext: (item, contextName, id) => {
    _contexts[contextName] ??= {};
    const context = _contexts[contextName];
    
    id = verifyId(id);
    return addToContext(item, context, id);
  },

  /**
   * Deregisters the item with the input id from the current context.
   * @param {number} id 
   * @returns {boolean} True if the item associated with the input id was deregistered successfully, otherwise returns false.
   */
  deregister: (id) => {
    return delete _currentContext[id];
  },

  /**
   * Deregisters the item with the input id from the specified context.
   * @param {string} contextName
   * @optional @param {number} id
   * @returns {boolean} True if the item associated with the input id was deregistered successfully, otherwise returns false.
   */
  deregisterFromContext: (contextName, id) => {
    return delete _contexts[contextName]?.[id];
  },

  /**
   * Generates a unique id and returns it.
   * @returns {number}
   */
  getUniqueId: () => {
    while (_currentContext[_idCounter]) _idCounter++;
    return _idCounter;
  }
};