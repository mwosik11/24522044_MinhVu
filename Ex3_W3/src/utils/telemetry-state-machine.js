
/**
 * Exercise 3 — PUBG Telemetry State Machine
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

const ALLOWED_TRANSITIONS = Object.freeze({
  [STATUS.IDLE]: [STATUS.LOADING],

  [STATUS.LOADING]: [
    STATUS.LOADING,
    STATUS.SUCCESS,
    STATUS.ERROR,
  ],

  [STATUS.SUCCESS]: [STATUS.LOADING],

  [STATUS.ERROR]: [STATUS.LOADING],
});

/**
 * Create the initial state before any telemetry request starts.
 */
export function createInitialState() {
  return Object.freeze({
    status: STATUS.IDLE,
  });
}

/**
 * Validate the payload required by each state.
 */
function validateState(state) {
  if (!state || typeof state !== 'object') {
    throw new TypeError('State must be an object.');
  }

  switch (state.status) {
    case STATUS.IDLE:
    case STATUS.LOADING:
      if ('data' in state || 'error' in state) {
        throw new Error(
          `${state.status} must not contain data or error.`
        );
      }
      break;

    case STATUS.SUCCESS:
      if (!('data' in state) || state.data == null) {
        throw new Error(
        'SUCCESS state requires valid data.'
        );
      }
    break;

    case STATUS.ERROR:
      if (
        typeof state.error !== 'string' ||
        state.error.trim() === ''
      ) {
        throw new Error(
          'ERROR state requires a non-empty error message.'
        );
      }
      break;

    default:
      throw new Error(
        `Unknown state status: ${String(state.status)}`
      );
  }

  return Object.freeze({ ...state });
}

/**
 * Validate a transition and return the next immutable state.
 */
export function transition(currentState, nextState) {
  const validatedCurrent = validateState(currentState);
  const validatedNext = validateState(nextState);

  const allowed = ALLOWED_TRANSITIONS[validatedCurrent.status];

  if (!allowed.includes(validatedNext.status)) {
    throw new Error(
      `Invalid transition: ${validatedCurrent.status} -> ${validatedNext.status}`
    );
  }

  return validatedNext;
}
