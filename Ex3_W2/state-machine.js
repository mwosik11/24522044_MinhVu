
/**
 * Exercise 3 — State Machine
 * Defines and validates the four lifecycle states.
 */

export const STATUS = Object.freeze({
  IDLE: 'IDLE',
  LOADING: 'LOADING',
  SUCCESS: 'SUCCESS',
  ERROR: 'ERROR',
});

const ALLOWED_TRANSITIONS = Object.freeze({
  [STATUS.IDLE]: [STATUS.LOADING],

  // A new request may start while another request is active.
  [STATUS.LOADING]: [
    STATUS.LOADING,
    STATUS.SUCCESS,
    STATUS.ERROR,
  ],

  [STATUS.SUCCESS]: [STATUS.LOADING],
  [STATUS.ERROR]: [STATUS.LOADING],
});

export function createInitialState() {
  return Object.freeze({
    status: STATUS.IDLE,
  });
}

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
      if (!('data' in state)) {
        throw new Error('SUCCESS state requires data.');
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
