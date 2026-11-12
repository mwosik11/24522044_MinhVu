
import {
  EFFORT_ACTOR,
  calculateEffortImpact,
} from "./effortCalculator.js";

/**
 * Calculate the total effort impact of both participants.
 *
 * EM represents my effort.
 * AI_DO represents the rival's effort.
 *
 * @param {Array} log
 * @returns {{ myImpact: number, rivalImpact: number }}
 */
export function calculateEffortTotals(log) {
  if (!Array.isArray(log)) {
    throw new TypeError("Effort log must be an array.");
  }

  return log.reduce(
    (totals, signal) => {
      const impact = calculateEffortImpact(signal);

      if (signal.actor === EFFORT_ACTOR.EM) {
        totals.myImpact += impact;
      } else if (signal.actor === EFFORT_ACTOR.AI_DO) {
        totals.rivalImpact += impact;
      } else {
        throw new Error(`Unknown effort actor: ${signal.actor}`);
      }

      return totals;
    },
    {
      myImpact: 0,
      rivalImpact: 0,
    },
  );
}
