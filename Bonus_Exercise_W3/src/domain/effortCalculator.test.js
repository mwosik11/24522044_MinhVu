
import test from "node:test";
import assert from "node:assert/strict";

import {
  EFFORT_ACTOR,
  getEffortMultiplier,
  createEffortSignal,
  calculateEffortImpact,
} from "./effortCalculator.js";

test("EM uses multiplier 0.1", () => {
  assert.equal(getEffortMultiplier(EFFORT_ACTOR.EM), 0.1);
});

test("AI_DO uses multiplier 50.0", () => {
  assert.equal(getEffortMultiplier(EFFORT_ACTOR.AI_DO), 50.0);
});

test("unknown actors are rejected", () => {
  assert.throws(
    () => getEffortMultiplier("UNKNOWN"),
    /Unknown effort actor/,
  );
});

test("createEffortSignal creates a valid EM signal", () => {
  const signal = createEffortSignal({
    id: "signal-001",
    actor: EFFORT_ACTOR.EM,
    steps: 100,
  });

  assert.deepEqual(signal, {
    id: "signal-001",
    actor: "EM",
    steps: 100,
    multiplier: 0.1,
  });
});

test("createEffortSignal converts numeric string steps", () => {
  const signal = createEffortSignal({
    id: "signal-002",
    actor: EFFORT_ACTOR.AI_DO,
    steps: "2",
  });

  assert.equal(signal.steps, 2);
  assert.equal(signal.multiplier, 50.0);
});

test("createEffortSignal rejects missing IDs", () => {
  assert.throws(
    () =>
      createEffortSignal({
        id: "",
        actor: EFFORT_ACTOR.EM,
        steps: 10,
      }),
    /requires an id/,
  );
});

test("createEffortSignal rejects negative or invalid steps", () => {
  for (const steps of [-1, "", null, "invalid"]) {
    assert.throws(
      () =>
        createEffortSignal({
          id: "invalid-signal",
          actor: EFFORT_ACTOR.EM,
          steps,
        }),
      RangeError,
    );
  }
});

test("calculateEffortImpact calculates EM impact correctly", () => {
  const signal = createEffortSignal({
    id: "signal-003",
    actor: EFFORT_ACTOR.EM,
    steps: 100,
  });

  assert.equal(calculateEffortImpact(signal), 10);
});

test("calculateEffortImpact calculates AI_DO impact correctly", () => {
  const signal = createEffortSignal({
    id: "signal-004",
    actor: EFFORT_ACTOR.AI_DO,
    steps: 1,
  });

  assert.equal(calculateEffortImpact(signal), 50);
});

test("calculateEffortImpact rejects invalid signals", () => {
  assert.throws(
    () => calculateEffortImpact({ steps: -1, multiplier: 0.1 }),
    RangeError,
  );

  assert.throws(
    () => calculateEffortImpact({ steps: 10, multiplier: NaN }),
    RangeError,
  );
});
