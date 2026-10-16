
/**
 * Exercise 3 — State Machine
 *
 * Defines the four permitted lifecycle states and validates
 * transitions between them.
 */

export const STATUS = Object.freeze({
  IDLE: 'IDLE',
  LOADING: 'LOADING',
  SUCCESS: 'SUCCESS',
  ERROR: 'ERROR',
});

// Define which transitions are allowed by the application.
const ALLOWED_TRANSITIONS = Object.freeze({
  [STATUS.IDLE]: [STATUS.LOADING],
  [STATUS.LOADING]: [STATUS.SUCCESS, STATUS.ERROR],
  [STATUS.SUCCESS]: [STATUS.LOADING],
  [STATUS.ERROR]: [STATUS.LOADING],
});

/**
 * Create the initial state before any data request starts.
 */
export function createInitialState() {
  return Object.freeze({
    status: STATUS.IDLE,
  });
}

/**
 * Validate the payload required by each state.
 * Invalid states are rejected before they reach the UI.
 */
function validateState(nextState) {
  if (!nextState || typeof nextState !== 'object') {
    throw new TypeError('State must be an object.');
  }

  switch (nextState.status) {
    case STATUS.IDLE:
    case STATUS.LOADING:
      if ('data' in nextState || 'error' in nextState) {
        throw new Error(
          `${nextState.status} must not contain data or error.`
        );
      }
      break;

    case STATUS.SUCCESS:
      if (!('data' in nextState)) {
        throw new Error('SUCCESS state requires data.');
      }
      break;

    case STATUS.ERROR:
      if (
        typeof nextState.error !== 'string' ||
        nextState.error.trim() === ''
      ) {
        throw new Error(
          'ERROR state requires a non-empty error message.'
        );
      }
      break;

    default:
      throw new Error(
        `Unknown state status: ${String(nextState.status)}`
      );
  }

  return Object.freeze({ ...nextState });
}

/**
 * Transition to another valid state.
 *
 * The current state is not modified. A new state object is returned.
 */
export function transition(currentState, nextState) {
  // Validate both states before checking the transition.
  validateState(currentState);
  const validatedNextState = validateState(nextState);

  const allowed = ALLOWED_TRANSITIONS[currentState.status];

  if (!allowed.includes(validatedNextState.status)) {
    throw new Error(
      `Invalid transition: ${currentState.status} -> ${validatedNextState.status}`
    );
  }

  return validatedNextState;
}
