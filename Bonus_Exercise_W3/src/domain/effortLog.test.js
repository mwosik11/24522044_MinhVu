
import test from "node:test";
import assert from "node:assert/strict";

import {
  INITIAL_EFFORT_LOG,
  appendEffortSignal,
} from "./effortLog.js";

const validSignal = {
  id: "signal-001",
  actor: "EM",
  steps: 100,
  multiplier: 0.1,
};

test("initial effort log is an empty array", () => {
  assert.ok(Array.isArray(INITIAL_EFFORT_LOG));
  assert.equal(INITIAL_EFFORT_LOG.length, 0);
});

test("appendEffortSignal returns a new array", () => {
  const oldLog = [];
  const newLog = appendEffortSignal(oldLog, validSignal);

  assert.notStrictEqual(newLog, oldLog);
  assert.equal(newLog.length, 1);
});

test("appendEffortSignal preserves the previous log", () => {
  const oldLog = [validSignal];

  const newSignal = {
    id: "signal-002",
    actor: "AI_DO",
    steps: 1,
    multiplier: 50,
  };

  const newLog = appendEffortSignal(oldLog, newSignal);

  assert.equal(oldLog.length, 1);
  assert.equal(newLog.length, 2);
  assert.strictEqual(oldLog[0], validSignal);
});

test("appendEffortSignal preserves the signal data", () => {
  const log = appendEffortSignal([], validSignal);

  assert.strictEqual(log[0], validSignal);
  assert.deepEqual(log[0], validSignal);
});

test("appendEffortSignal rejects a non-array log", () => {
  assert.throws(
    () => appendEffortSignal(null, validSignal),
    TypeError,
  );
});

test("appendEffortSignal rejects a missing signal", () => {
  assert.throws(
    () => appendEffortSignal([], null),
    TypeError,
  );
});

test("appendEffortSignal rejects an invalid actor", () => {
  assert.throws(
    () =>
      appendEffortSignal([], {
        ...validSignal,
        actor: "UNKNOWN",
      }),
    /Invalid effort signal/,
  );
});

test("appendEffortSignal rejects negative steps", () => {
  assert.throws(
    () =>
      appendEffortSignal([], {
        ...validSignal,
        steps: -1,
      }),
    /Invalid effort signal/,
  );
});

test("appendEffortSignal rejects an invalid multiplier", () => {
  assert.throws(
    () =>
      appendEffortSignal([], {
        ...validSignal,
        multiplier: NaN,
      }),
    /Invalid effort signal/,
  );
});
