
/**
 * Bonus Exercise – Hen Ho Nhung Khong Yeu
 * Immutable Effort Log.
 */

export const INITIAL_EFFORT_LOG = Object.freeze([]);

/**
 * Append an effort signal without mutating the existing log.
 *
 * @param {Array} log
 * @param {{
 *   id: string,
 *   actor: "EM" | "AI_DO",
 *   steps: number,
 *   multiplier: number
 * }} signal
 * @returns {Array}
 */
export function appendEffortSignal(log, signal) {
  if (!Array.isArray(log)) {
    throw new TypeError("Effort log must be an array.");
  }

  if (!signal || typeof signal !== "object") {
    throw new TypeError("Effort signal must be an object.");
  }

  const { id, actor, steps, multiplier } = signal;

  if (
    id === undefined ||
    id === null ||
    id === "" ||
    !["EM", "AI_DO"].includes(actor) ||
    !Number.isFinite(steps) ||
    steps < 0 ||
    !Number.isFinite(multiplier) ||
    multiplier < 0
  ) {
    throw new TypeError("Invalid effort signal.");
  }

  // Return a new array; do not mutate the previous log.
  return [...log, signal];
}
