
/**
 * Exercise 2 — Reactive State Engine
 * Task 1: State store and cursor
 * Task 2: Reactive useState dispatcher
 */

export const stateStore = [];

let stateCursor = 0;
let rerenderCallback = null;

// Task 1: Reset the cursor before each component render.
export function resetCursor() {
  stateCursor = 0;
}

// Task 1: Reserve the next state slot.
export function getNextStateIndex() {
  const currentIndex = stateCursor;
  stateCursor += 1;
  return currentIndex;
}

// Task 2: Register the function that re-renders the application.
export function setRerenderCallback(callback) {
  if (typeof callback !== 'function') {
    throw new TypeError(
      'setRerenderCallback: callback must be a function.'
    );
  }

  rerenderCallback = callback;
}

// Task 2: Minimal closure-based state hook.
export function useState(initialValue) {
  const stateIndex = getNextStateIndex();

  // Initialize the slot only once.
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

    // Avoid unnecessary renders when the value is unchanged.
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
