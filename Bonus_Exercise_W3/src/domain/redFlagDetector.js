
import { RELATIONSHIP_PHASE } from "./relationshipMachine.js";

/**
 * Determine whether the current relationship has a red flag.
 *
 * Red Flag condition:
 * - Current phase is DATING_NO_LOVE.
 * - My effort impact is lower than the rival's effort impact.
 *
 * @param {{
 *   phase: string,
 *   myImpact: number,
 *   rivalImpact: number
 * }} metrics
 * @returns {boolean}
 */
export function detectRedFlag({ phase, myImpact, rivalImpact }) {
  if (
    !Number.isFinite(myImpact) ||
    !Number.isFinite(rivalImpact) ||
    myImpact < 0 ||
    rivalImpact < 0
  ) {
    throw new RangeError("Effort impacts must be non-negative finite numbers.");
  }

  return (
    phase === RELATIONSHIP_PHASE.DATING_NO_LOVE &&
    myImpact < rivalImpact
  );
}
