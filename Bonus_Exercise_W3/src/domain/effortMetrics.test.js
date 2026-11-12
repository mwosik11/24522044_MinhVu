
import test from "node:test";
import assert from "node:assert/strict";

import { calculateEffortTotals } from "./effortMetrics.js";

test("empty log returns zero impacts", () => {
  assert.deepEqual(calculateEffortTotals([]), {
    myImpact: 0,
    rivalImpact: 0,
  });
});

test("calculates EM impact correctly", () => {
  const log = [
    {
      id: "signal-001",
      actor: "EM",
      steps: 100,
      multiplier: 0.1,
    },
  ];

  assert.deepEqual(calculateEffortTotals(log), {
    myImpact: 10,
    rivalImpact: 0,
  });
});

test("calculates AI_DO impact correctly", () => {
  const log = [
    {
      id: "signal-002",
      actor: "AI_DO",
      steps: 1,
      multiplier: 50,
    },
  ];

  assert.deepEqual(calculateEffortTotals(log), {
    myImpact: 0,
    rivalImpact: 50,
  });
});

test("aggregates multiple signals from both participants", () => {
  const log = [
    {
      id: "signal-001",
      actor: "EM",
      steps: 100,
      multiplier: 0.1,
    },
    {
      id: "signal-002",
      actor: "EM",
      steps: 50,
      multiplier: 0.1,
    },
    {
      id: "signal-003",
      actor: "AI_DO",
      steps: 1,
      multiplier: 50,
    },
    {
      id: "signal-004",
      actor: "AI_DO",
      steps: 2,
      multiplier: 50,
    },
  ];

  assert.deepEqual(calculateEffortTotals(log), {
    myImpact: 15,
    rivalImpact: 150,
  });
});

test("does not mutate the original effort log", () => {
  const log = [
    {
      id: "signal-001",
      actor: "EM",
      steps: 100,
      multiplier: 0.1,
    },
  ];

  const originalLog = [...log];

  calculateEffortTotals(log);

  assert.deepEqual(log, originalLog);
});

test("rejects a non-array log", () => {
  assert.throws(
    () => calculateEffortTotals(null),
    /Effort log must be an array/,
  );
});

test("rejects signals with invalid impact values", () => {
  const log = [
    {
      id: "signal-001",
      actor: "EM",
      steps: -1,
      multiplier: 0.1,
    },
  ];

  assert.throws(
    () => calculateEffortTotals(log),
    RangeError,
  );
});

test("rejects unknown actors", () => {
  const log = [
    {
      id: "signal-001",
      actor: "UNKNOWN",
      steps: 10,
      multiplier: 1,
    },
  ];

  assert.throws(
    () => calculateEffortTotals(log),
    /Unknown effort actor/,
  );
});
