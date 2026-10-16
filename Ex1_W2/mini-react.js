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