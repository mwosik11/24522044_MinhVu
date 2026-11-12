
/**
 * Bonus Exercise – Hen Ho Nhung Khong Yeu
 * Deterministic Relationship Finite State Machine.
 */

export const RELATIONSHIP_PHASE = Object.freeze({
  FRIENDS: "FRIENDS",
  DATING_NO_LOVE: "DATING_NO_LOVE",
  OFFICIAL_LOVE: "OFFICIAL_LOVE",
  GHOSTED_EXIT: "GHOSTED_EXIT",
});

export const RELATIONSHIP_EVENT = Object.freeze({
  START_DATING: "START_DATING",
  RETURN_TO_FRIENDS: "RETURN_TO_FRIENDS",
  COMMIT: "COMMIT",
  GHOST: "GHOST",
});

export const INITIAL_RELATIONSHIP_STATE = Object.freeze({
  phase: RELATIONSHIP_PHASE.DATING_NO_LOVE,
});

/**
 * Allowed relationship transitions.
 *
 * Invalid transitions preserve the current state.
 * GHOSTED_EXIT is a terminal state.
 */
const TRANSITIONS = Object.freeze({
  [RELATIONSHIP_PHASE.FRIENDS]: {
    [RELATIONSHIP_EVENT.START_DATING]:
      RELATIONSHIP_PHASE.DATING_NO_LOVE,
  },

  [RELATIONSHIP_PHASE.DATING_NO_LOVE]: {
    [RELATIONSHIP_EVENT.RETURN_TO_FRIENDS]:
      RELATIONSHIP_PHASE.FRIENDS,

    [RELATIONSHIP_EVENT.COMMIT]:
      RELATIONSHIP_PHASE.OFFICIAL_LOVE,

    [RELATIONSHIP_EVENT.GHOST]:
      RELATIONSHIP_PHASE.GHOSTED_EXIT,
  },

  [RELATIONSHIP_PHASE.OFFICIAL_LOVE]: {},

  [RELATIONSHIP_PHASE.GHOSTED_EXIT]: {},
});

/**
 * Pure state transition function.
 *
 * @param {{ phase: string }} state
 * @param {{ type: string }} event
 * @returns {{ phase: string }}
 */
export function relationshipReducer(state, event) {
  const nextPhase = TRANSITIONS[state.phase]?.[event.type];

  if (!nextPhase) {
    return state;
  }

  return {
    phase: nextPhase,
  };
}
