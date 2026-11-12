
import test from "node:test";
import assert from "node:assert/strict";

import { RELATIONSHIP_PHASE } from "./relationshipMachine.js";
import { detectRedFlag } from "./redFlagDetector.js";

const {
  FRIENDS,
  DATING_NO_LOVE,
  OFFICIAL_LOVE,
  GHOSTED_EXIT,
} = RELATIONSHIP_PHASE;

test("detects a red flag when my impact is lower", () => {
  assert.equal(
    detectRedFlag({
      phase: DATING_NO_LOVE,
      myImpact: 10,
      rivalImpact: 50,
    }),
    true,
  );
});

test("does not detect a red flag when my impact is higher", () => {
  assert.equal(
    detectRedFlag({
      phase: DATING_NO_LOVE,
      myImpact: 100,
      rivalImpact: 50,
    }),
    false,
  );
});

test("does not detect a red flag when both impacts are equal", () => {
  assert.equal(
    detectRedFlag({
      phase: DATING_NO_LOVE,
      myImpact: 50,
      rivalImpact: 50,
    }),
    false,
  );
});

test("does not detect a red flag in FRIENDS phase", () => {
  assert.equal(
    detectRedFlag({
      phase: FRIENDS,
      myImpact: 10,
      rivalImpact: 50,
    }),
    false,
  );
});

test("does not detect a red flag in OFFICIAL_LOVE phase", () => {
  assert.equal(
    detectRedFlag({
      phase: OFFICIAL_LOVE,
      myImpact: 10,
      rivalImpact: 50,
    }),
    false,
  );
});

test("does not detect a red flag in GHOSTED_EXIT phase", () => {
  assert.equal(
    detectRedFlag({
      phase: GHOSTED_EXIT,
      myImpact: 10,
      rivalImpact: 50,
    }),
    false,
  );
});

test("rejects negative effort impacts", () => {
  assert.throws(
    () =>
      detectRedFlag({
        phase: DATING_NO_LOVE,
        myImpact: -1,
        rivalImpact: 50,
      }),
    RangeError,
  );

  assert.throws(
    () =>
      detectRedFlag({
        phase: DATING_NO_LOVE,
        myImpact: 10,
        rivalImpact: -1,
      }),
    RangeError,
  );
});

test("rejects non-finite effort impacts", () => {
  for (const invalidImpact of [NaN, Infinity, -Infinity]) {
    assert.throws(
      () =>
        detectRedFlag({
          phase: DATING_NO_LOVE,
          myImpact: invalidImpact,
          rivalImpact: 50,
        }),
      RangeError,
    );
  }
});
