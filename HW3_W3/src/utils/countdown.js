
/**
 * HW3 – PUBG Vietnam Arena
 * Absolute timestamp-based countdown utility.
 */

/**
 * Calculate remaining time using an absolute target timestamp.
 *
 * @param {number} targetEpochMs - Target timestamp in milliseconds.
 * @param {number} nowMs - Current timestamp in milliseconds.
 * @param {number} serverOffsetMs - Server clock offset in milliseconds.
 * @returns {number} Remaining time in milliseconds.
 *
 * Formula:
 * max(0, targetEpochMs - (nowMs + serverOffsetMs))
 */
export function calculateRemainingMs(
  targetEpochMs,
  nowMs = Date.now(),
  serverOffsetMs = 0
) {
  const values = [targetEpochMs, nowMs, serverOffsetMs];

  if (!values.every(Number.isFinite)) {
    throw new TypeError(
      "Countdown timestamps and server offset must be finite numbers."
    );
  }

  const adjustedNow = nowMs + serverOffsetMs;

  return Math.max(0, targetEpochMs - adjustedNow);
}
