/**
 * Pure swipe-deck logic — no React, no fetch. Everything here is unit-tested.
 * See TASK_DECOMPOSITION.md §1.4 for the state contract.
 */

export const ACTIONS = Object.freeze({ LIKE: 'LIKE', NOPE: 'NOPE', FRIENDZONE: 'FRIENDZONE' });

/** Gesture / arrow-key direction → recorded action. */
export const DIRECTION_TO_ACTION = Object.freeze({
  right: ACTIONS.LIKE,
  left: ACTIONS.NOPE,
  up: ACTIONS.FRIENDZONE,
});

/** Asymmetric scoring: only a LIKE earns points, every other decision costs. */
export const SCORE_RULES = Object.freeze({
  [ACTIONS.LIKE]: 10,
  [ACTIONS.NOPE]: -5,
  [ACTIONS.FRIENDZONE]: -5,
});

export const SWIPE_THRESHOLD_PX = 80;

/** Derived score — recomputed from the history on every render, never stored. */
export function computeScore(history) {
  return history.reduce((total, entry) => total + (SCORE_RULES[entry.action] ?? 0), 0);
}

/** Derived counters per action. */
export function computeStats(history) {
  const stats = { [ACTIONS.LIKE]: 0, [ACTIONS.NOPE]: 0, [ACTIONS.FRIENDZONE]: 0 };
  for (const entry of history) stats[entry.action] += 1;
  return stats;
}

/** Profiles not decided yet, in deck order. Undoing a swipe puts that card back on top. */
export function getRemainingProfiles(profiles, history) {
  const decided = new Set(history.map((entry) => entry.profileSlug));
  return profiles.filter((profile) => !decided.has(profile.slug));
}

/**
 * Map a drag distance to a direction. Vertical wins only when it dominates,
 * so a slightly diagonal right-drag still counts as a LIKE.
 * @returns {'left'|'right'|'up'|null}
 */
export function getGestureDirection(dx, dy, threshold = SWIPE_THRESHOLD_PX) {
  if (-dy > threshold && Math.abs(dy) > Math.abs(dx)) return 'up';
  if (dx > threshold) return 'right';
  if (dx < -threshold) return 'left';
  return null;
}

// ---------------------------------------------------------------------------
// Reducer — the history array IS the LIFO undo stack (push on swipe, pop on undo).
// ---------------------------------------------------------------------------

export const initialSwipeState = Object.freeze({ history: [] });

/**
 * @typedef {{ clientId: string, profileSlug: string, action: keyof typeof ACTIONS }} SwipeEntry
 * @param {{ history: SwipeEntry[] }} state
 */
export function swipeReducer(state, event) {
  switch (event.type) {
    case 'HYDRATE':
      return { history: event.history };

    case 'SWIPE': {
      // Guard double-fires (e.g. key + pointer in the same frame).
      if (state.history.some((e) => e.profileSlug === event.entry.profileSlug)) return state;
      return { history: [...state.history, event.entry] };
    }

    case 'UNDO':
      if (state.history.length === 0) return state;
      return { history: state.history.slice(0, -1) };

    // Server rejected a POST → remove exactly that entry (it may no longer be on top).
    case 'ROLLBACK_SWIPE':
      return { history: state.history.filter((e) => e.clientId !== event.clientId) };

    // Server rejected a DELETE → push the entry back on top of the stack.
    case 'RESTORE_ENTRY':
      if (state.history.some((e) => e.clientId === event.entry.clientId)) return state;
      return { history: [...state.history, event.entry] };

    default:
      throw new Error(`Unknown swipe event: ${event.type}`);
  }
}