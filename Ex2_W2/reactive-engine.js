// Stores state values between renders.
export const stateStore = [];

// Tracks the position of the next state hook.
let stateCursor = 0;

// Resets the cursor before each component render.
export function resetCursor() {
  stateCursor = 0;
}

// Reserves the current cursor position for a state hook.
// This accessor will be used by useState() in Task 2.
export function getNextStateIndex() {
  const currentIndex = stateCursor;
  stateCursor += 1;

  return currentIndex;
}