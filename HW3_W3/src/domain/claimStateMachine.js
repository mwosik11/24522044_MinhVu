
import { CLAIM_STATUS } from "./pubgContracts.js";

/**
 * Claim state machine actions.
 */
export const CLAIM_ACTION = Object.freeze({
  START: "CLAIM_STARTED",
  SUCCESS: "CLAIM_SUCCEEDED",
  CONFLICT: "CLAIM_CONFLICTED",
  ERROR: "CLAIM_FAILED",
  RESET: "CLAIM_RESET",
});

/**
 * Create the initial claim state.
 */
export function createInitialClaimState() {
  return {
    status: CLAIM_STATUS.IDLE,
    claimId: null,
    error: null,
  };
}

/**
 * Deterministic claim state reducer.
 *
 * Valid transitions:
 * IDLE / SUCCESS / CONFLICT / ERROR -> PENDING
 * PENDING -> SUCCESS / CONFLICT / ERROR
 * SUCCESS / CONFLICT / ERROR -> IDLE (RESET)
 *
 * A pending claim cannot be reset or replaced.
 */
export function claimReducer(state, action) {
  switch (action.type) {
    case CLAIM_ACTION.START: {
      if (state.status === CLAIM_STATUS.PENDING) {
        return state;
      }

      if (
        typeof action.claimId !== "string" ||
        action.claimId.trim() === ""
      ) {
        return state;
      }

      return {
        status: CLAIM_STATUS.PENDING,
        claimId: action.claimId,
        error: null,
      };
    }

    case CLAIM_ACTION.SUCCESS: {
      if (
        state.status !== CLAIM_STATUS.PENDING ||
        state.claimId !== action.claimId
      ) {
        return state;
      }

      return {
        ...state,
        status: CLAIM_STATUS.SUCCESS,
        error: null,
      };
    }

    case CLAIM_ACTION.CONFLICT: {
      if (
        state.status !== CLAIM_STATUS.PENDING ||
        state.claimId !== action.claimId
      ) {
        return state;
      }

      return {
        ...state,
        status: CLAIM_STATUS.CONFLICT,
        error:
          action.message ||
          "The item is no longer available.",
      };
    }

    case CLAIM_ACTION.ERROR: {
      if (
        state.status !== CLAIM_STATUS.PENDING ||
        state.claimId !== action.claimId
      ) {
        return state;
      }

      return {
        ...state,
        status: CLAIM_STATUS.ERROR,
        error:
          action.message ||
          "An unexpected claim error occurred.",
      };
    }

    case CLAIM_ACTION.RESET: {
      if (state.status === CLAIM_STATUS.PENDING) {
        return state;
      }

      return createInitialClaimState();
    }

    default:
      return state;
  }
}
