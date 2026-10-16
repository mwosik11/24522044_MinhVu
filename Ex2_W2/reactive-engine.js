
/**
 * Exercise 2 — Reactive State Engine
 * Task 1: State store and cursor
 * Task 2: Reactive useState dispatcher
 * Task 3: VNode creation and DOM rendering
 */

export const stateStore = [];

let stateCursor = 0;
let rerenderCallback = null;

// TASK 1: Reset the cursor before each render.
export function resetCursor() {
  stateCursor = 0;
}

// TASK 1: Reserve the next state slot.
export function getNextStateIndex() {
  const currentIndex = stateCursor;
  stateCursor += 1;
  return currentIndex;
}

// TASK 2: Register the application's rerender function.
export function setRerenderCallback(callback) {
  if (typeof callback !== 'function') {
    throw new TypeError(
      'setRerenderCallback: callback must be a function.'
    );
  }

  rerenderCallback = callback;
}

// TASK 2: Closure-based state hook.
export function useState(initialValue) {
  const stateIndex = getNextStateIndex();

  if (!(stateIndex in stateStore)) {
    stateStore[stateIndex] =
      typeof initialValue === 'function'
        ? initialValue()
        : initialValue;
  }

  function setState(nextValue) {
    const previousValue = stateStore[stateIndex];

    const resolvedValue =
      typeof nextValue === 'function'
        ? nextValue(previousValue)
        : nextValue;

    if (Object.is(previousValue, resolvedValue)) {
      return;
    }

    stateStore[stateIndex] = resolvedValue;

    if (rerenderCallback) {
      rerenderCallback();
    }
  }

  return [stateStore[stateIndex], setState];
}

// TASK 3: Create a Virtual DOM node.
export function createElement(type, props, ...children) {
  if (typeof type !== 'string' || type.length === 0) {
    throw new TypeError(
      'createElement: type must be a non-empty string.'
    );
  }

  const normalizedProps = { ...(props ?? {}) };

  function createTextElement(value) {
    return {
      type: 'TEXT_ELEMENT',
      props: {
        nodeValue: String(value),
        children: [],
      },
    };
  }

  function normalizeChild(child) {
    if (Array.isArray(child)) {
      return child.flat(Infinity).map(normalizeChild).flat();
    }

    if (
      child === null ||
      child === undefined ||
      typeof child === 'boolean'
    ) {
      return [];
    }

    if (
      typeof child === 'string' ||
      typeof child === 'number'
    ) {
      return [createTextElement(child)];
    }

    if (
      typeof child === 'object' &&
      typeof child.type === 'string' &&
      child.props &&
      typeof child.props === 'object'
    ) {
      return [child];
    }

    throw new TypeError(
      'createElement: unsupported child type.'
    );
  }

  normalizedProps.children = children
    .map(normalizeChild)
    .flat();

  return {
    type,
    props: normalizedProps,
  };
}

// TASK 3: Convert a VNode into a real DOM node.
export function renderToDOM(vNode) {
  if (
    !vNode ||
    typeof vNode !== 'object' ||
    typeof vNode.type !== 'string' ||
    !vNode.props ||
    typeof vNode.props !== 'object' ||
    !Array.isArray(vNode.props.children)
  ) {
    throw new TypeError('renderToDOM: invalid VNode.');
  }

  if (vNode.type === 'TEXT_ELEMENT') {
    const textNode = document.createTextNode(
      String(vNode.props.nodeValue ?? '')
    );

    textNode.__vnode = vNode;
    return textNode;
  }

  const dom = document.createElement(vNode.type);

  // The delegation hub uses this reference to find handlers.
  dom.__vnode = vNode;

  Object.entries(vNode.props).forEach(([name, value]) => {
    if (
      name === 'children' ||
      name === 'key' ||
      name === 'ref' ||
      value === null ||
      value === undefined
    ) {
      return;
    }

    // Event handlers are stored in the VNode, not DOM attributes.
    if (/^on/i.test(name)) {
      if (
        !/^on[a-z]+$/i.test(name) ||
        typeof value !== 'function'
      ) {
        throw new TypeError(
          `renderToDOM: invalid event prop "${name}".`
        );
      }

      return;
    }

    if (name === 'dangerouslySetInnerHTML') {
      throw new Error(
        'renderToDOM: raw HTML injection is not supported.'
      );
    }

    if (name === 'className') {
      dom.className = String(value);
      return;
    }

    if (name === 'htmlFor') {
      dom.htmlFor = String(value);
      return;
    }

    if (name === 'style') {
      if (
        typeof value !== 'object' ||
        value === null ||
        Array.isArray(value)
      ) {
        throw new TypeError(
          'renderToDOM: style must be an object.'
        );
      }

      Object.assign(dom.style, value);
      return;
    }

    if (
      ['href', 'src', 'xlink:href'].includes(name) &&
      /^\s*(javascript|vbscript):/i.test(String(value))
    ) {
      throw new Error('renderToDOM: unsafe URL scheme.');
    }

    const propertyNames = {
      readOnly: 'readOnly',
      tabIndex: 'tabIndex',
      autoFocus: 'autofocus',
    };

    const domName = propertyNames[name] ?? name;

    if (
      [
        'value',
        'checked',
        'disabled',
        'selected',
        'multiple',
        'required',
        'readOnly',
        'hidden',
        'tabIndex',
      ].includes(name)
    ) {
      dom[domName] = value;
      return;
    }

    if (typeof value === 'boolean') {
      if (value) {
        dom.setAttribute(name, '');
      }
      return;
    }

    dom.setAttribute(name, String(value));
  });

  vNode.props.children.forEach((child) => {
    dom.appendChild(renderToDOM(child));
  });

  return dom;
}
