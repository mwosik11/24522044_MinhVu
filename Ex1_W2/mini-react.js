export function createTextElement(text) {
  return {
    type: 'TEXT_ELEMENT',
    props: {
      nodeValue: String(text),
      children: [],
    },
  };
}

export function createElement(type, props, ...children) {
  if (typeof type !== 'string' || type.length === 0) {
    throw new TypeError(
      'createElement: type must be a non-empty string.'
    );
  }

  const normalizedChildren = children
    .flat(Infinity)
    .filter(
      (child) =>
        child !== null &&
        child !== undefined &&
        child !== false
    )
    .map((child) => {
      // Convert text and numbers into text VNodes.
      if (
        typeof child === 'string' ||
        typeof child === 'number'
      ) {
        return createTextElement(child);
      }

      // Preserve an existing valid VNode.
      if (
        typeof child === 'object' &&
        child !== null &&
        typeof child.type === 'string' &&
        child.props !== null &&
        typeof child.props === 'object' &&
        Array.isArray(child.props.children)
      ) {
        return child;
      }

      throw new TypeError(
        'createElement: child must be a primitive or a valid VNode.'
      );
    });

  return {
    type,
    props: {
      ...(props ?? {}),
      children: normalizedChildren,
    },
  };
}

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

  // 1. Render text nodes safely.
  if (vNode.type === 'TEXT_ELEMENT') {
    return document.createTextNode(
      String(vNode.props.nodeValue ?? '')
    );
  }

  // 2. Create a real HTML element.
  const dom = document.createElement(vNode.type);

  // 3. Apply props and register event handlers.
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

    // Prevent raw HTML injection.
    if (name === 'dangerouslySetInnerHTML') {
      throw new Error(
        'renderToDOM: raw HTML injection is not supported.'
      );
    }

    // Register events using addEventListener().
    if (/^on/i.test(name)) {
      if (!/^on[a-z]+$/i.test(name) || typeof value !== 'function') {
        throw new TypeError(
          `renderToDOM: invalid event prop "${name}".`
        );
      }

      const eventType = name.slice(2).toLowerCase();
      dom.addEventListener(eventType, value);
      return;
    }

    // Handle common DOM property aliases.
    if (name === 'className') {
      dom.className = String(value);
      return;
    }

    if (name === 'htmlFor') {
      dom.htmlFor = String(value);
      return;
    }

    // Apply inline styles from an object.
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

    // Reject dangerous URL schemes.
    if (
      ['href', 'src', 'xlink:href'].includes(name) &&
      /^\s*(javascript|vbscript):/i.test(String(value))
    ) {
      throw new Error('renderToDOM: unsafe URL scheme.');
    }

    // Handle common boolean DOM properties.
    if (typeof value === 'boolean') {
      const booleanProperties = [
        'disabled',
        'checked',
        'selected',
        'multiple',
        'required',
        'readOnly',
        'hidden',
        'autoFocus',
      ];

      if (booleanProperties.includes(name)) {
        dom[name] = value;
      } else if (value) {
        dom.setAttribute(name, '');
      }

      return;
    }

    // Set ordinary attributes.
    dom.setAttribute(name, String(value));
  });

  // 4. Recursively render and append children.
  vNode.props.children.forEach((child) => {
    dom.appendChild(renderToDOM(child));
  });

  return dom;
}