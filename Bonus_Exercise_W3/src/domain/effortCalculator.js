
/**
 * Bonus Exercise – Hen Ho Nhung Khong Yeu
 * Asymmetric Effort Calculator.
 */

export const EFFORT_ACTOR = Object.freeze({
  EM: "EM",
  AI_DO: "AI_DO",
});

export const EFFORT_MULTIPLIER = Object.freeze({
  [EFFORT_ACTOR.EM]: 0.1,
  [EFFORT_ACTOR.AI_DO]: 50.0,
});

/**
 * Get the impact multiplier for an actor.
 *
 * @param {"EM" | "AI_DO"} actor
 * @returns {number}
 */
export function getEffortMultiplier(actor) {
  const multiplier = EFFORT_MULTIPLIER[actor];

  if (multiplier === undefined) {
    throw new Error(`Unknown effort actor: ${actor}`);
  }

  return multiplier;
}

/**
 * Create a validated and immutable effort signal.
 *
 * @param {{ id: string, actor: string, steps: number }} input
 * @returns {{ id: string, actor: string, steps: number, multiplier: number }}
 */
export function createEffortSignal({ id, actor, steps }) {
  if (id === undefined || id === null || id === "") {
    throw new Error("Effort signal requires an id.");
  }

  const normalizedSteps = Number(steps);

  if (
    steps === "" ||
    steps === null ||
    !Number.isFinite(normalizedSteps) ||
    normalizedSteps < 0
  ) {
    throw new RangeError("Effort steps must be a non-negative number.");
  }

  return Object.freeze({
    id,
    actor,
    steps: normalizedSteps,
    multiplier: getEffortMultiplier(actor),
  });
}

/**
 * Calculate the impact of one effort signal.
 *
 * @param {{ steps: number, multiplier: number }} signal
 * @returns {number}
 */
export function calculateEffortImpact(signal) {
  const steps = Number(signal?.steps);
  const multiplier = Number(signal?.multiplier);

  if (
    !Number.isFinite(steps) ||
    steps < 0 ||
    !Number.isFinite(multiplier) ||
    multiplier < 0
  ) {
    throw new RangeError("Invalid effort signal.");
  }

  return steps * multiplier;
}
