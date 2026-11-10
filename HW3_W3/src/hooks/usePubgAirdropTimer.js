
import { useEffect, useState } from "react";
import { calculateRemainingMs } from "../utils/countdown.js";

/**
 * React hook for an absolute timestamp-based PUBG airdrop countdown.
 *
 * @param {number} targetEpochMs - Target timestamp in milliseconds.
 * @param {number} serverOffsetMs - Server clock offset in milliseconds.
 *
 * @returns {{
 *   remainingMs: number,
 *   isLive: boolean
 * }}
 */
export function usePubgAirdropTimer(
  targetEpochMs,
  serverOffsetMs = 0
) {
  const [remainingMs, setRemainingMs] = useState(() =>
    calculateRemainingMs(
      targetEpochMs,
      Date.now(),
      serverOffsetMs
    )
  );

  useEffect(() => {
    // Recalculate from the absolute timestamp.
    const syncClock = () => {
      const remaining = calculateRemainingMs(
        targetEpochMs,
        Date.now(),
        serverOffsetMs
      );

      setRemainingMs(remaining);
    };

    // Synchronize immediately when the effect starts.
    syncClock();

    // Update the countdown every 200ms.
    const timerId = window.setInterval(syncClock, 200);

    // Resynchronize when the browser tab becomes visible.
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        syncClock();
      }
    };

    document.addEventListener(
      "visibilitychange",
      handleVisibilityChange
    );

    // Clean up timer and event listener.
    return () => {
      window.clearInterval(timerId);

      document.removeEventListener(
        "visibilitychange",
        handleVisibilityChange
      );
    };
  }, [targetEpochMs, serverOffsetMs]);

  return {
    remainingMs,
    isLive: remainingMs === 0,
  };
}
