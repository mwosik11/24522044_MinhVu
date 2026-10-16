
/**
 * Exercise 2 — Root Event Delegation Hub
 * Supported events: click, input, keydown
 */

const SUPPORTED_EVENTS = ['click', 'input', 'keydown', 'submit'];
const registeredRoots = new WeakMap();

export function setupEventDelegation(rootContainer) {
  if (
    !rootContainer ||
    rootContainer.nodeType !== 1 ||
    typeof rootContainer.addEventListener !== 'function'
  ) {
    throw new TypeError(
      'setupEventDelegation: rootContainer must be a DOM Element.'
    );
  }

  // Avoid registering duplicate listeners on the same root.
  if (registeredRoots.has(rootContainer)) {
    return registeredRoots.get(rootContainer);
  }

  const registeredEvents = new Set();

  SUPPORTED_EVENTS.forEach((eventType) => {
    rootContainer.addEventListener(eventType, (nativeEvent) => {
      let target = nativeEvent.target;

      while (target && target !== rootContainer) {
        const vnode = target.__vnode;

        if (vnode?.props) {
          const handlerProp =
            `on${eventType.charAt(0).toUpperCase()}${eventType.slice(1)}`;

          const handler = vnode.props[handlerProp];

          if (typeof handler === 'function') {
            handler(nativeEvent);
            return;
          }
        }

        target = target.parentElement;
      }
    });

    registeredEvents.add(eventType);
  });

  registeredRoots.set(rootContainer, registeredEvents);

  return registeredEvents;
}
