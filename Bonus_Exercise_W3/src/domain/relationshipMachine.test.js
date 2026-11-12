
import test from "node:test";
import assert from "node:assert/strict";

import {
  RELATIONSHIP_PHASE,
  RELATIONSHIP_EVENT,
  INITIAL_RELATIONSHIP_STATE,
  relationshipReducer,
} from "./relationshipMachine.js";

const {
  FRIENDS,
  DATING_NO_LOVE,
  OFFICIAL_LOVE,
  GHOSTED_EXIT,
} = RELATIONSHIP_PHASE;

const {
  START_DATING,
  RETURN_TO_FRIENDS,
  COMMIT,
  GHOST,
} = RELATIONSHIP_EVENT;

test("initial state starts in DATING_NO_LOVE", () => {
  assert.equal(INITIAL_RELATIONSHIP_STATE.phase, DATING_NO_LOVE);
});

test("FRIENDS can transition to DATING_NO_LOVE", () => {
  const result = relationshipReducer(
    { phase: FRIENDS },
    { type: START_DATING },
  );

  assert.deepEqual(result, { phase: DATING_NO_LOVE });
});

test("DATING_NO_LOVE can return to FRIENDS", () => {
  const result = relationshipReducer(
    { phase: DATING_NO_LOVE },
    { type: RETURN_TO_FRIENDS },
  );

  assert.deepEqual(result, { phase: FRIENDS });
});

test("DATING_NO_LOVE can transition to OFFICIAL_LOVE", () => {
  const result = relationshipReducer(
    { phase: DATING_NO_LOVE },
    { type: COMMIT },
  );

  assert.deepEqual(result, { phase: OFFICIAL_LOVE });
});

test("DATING_NO_LOVE can transition to GHOSTED_EXIT", () => {
  const result = relationshipReducer(
    { phase: DATING_NO_LOVE },
    { type: GHOST },
  );

  assert.deepEqual(result, { phase: GHOSTED_EXIT });
});

test("invalid transitions preserve the current state", () => {
  const state = { phase: FRIENDS };

  const result = relationshipReducer(state, { type: COMMIT });

  assert.strictEqual(result, state);
});

test("OFFICIAL_LOVE is terminal", () => {
  const state = { phase: OFFICIAL_LOVE };

  const result = relationshipReducer(state, { type: GHOST });

  assert.strictEqual(result, state);
});

test("GHOSTED_EXIT is terminal", () => {
  const state = { phase: GHOSTED_EXIT };

  const result = relationshipReducer(state, { type: START_DATING });

  assert.strictEqual(result, state);
});

test("valid transitions do not mutate the previous state", () => {
  const state = { phase: DATING_NO_LOVE };

  relationshipReducer(state, { type: COMMIT });

  assert.deepEqual(state, { phase: DATING_NO_LOVE });
});
