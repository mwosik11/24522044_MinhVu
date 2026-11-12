
import { useEffect, useState } from "react";

import { RELATIONSHIP_PHASE } from "../domain/relationshipMachine.js";

const GHOSTING_DELAY_MS = 5000;

/**
 * Start a 5-second timeout after the first participant
 * records an effort signal.
 *
 * Cancel the timeout when:
 * - The other participant records a reciprocal signal.
 * - The relationship phase changes.
 * - The component unmounts.
 *
 * @param {string} phase
 * @param {boolean} isWaitingForMutualResponse
 * @param {Function} setPhase
 * @returns {{ remainingSeconds: number | null }}
 */
export function useGhostingTimer(
  phase,
  isWaitingForMutualResponse,
  setPhase,
) {
  const [remainingSeconds, setRemainingSeconds] =
    useState(null);

  useEffect(() => {
    if (
      phase !== RELATIONSHIP_PHASE.DATING_NO_LOVE ||
      !isWaitingForMutualResponse
    ) {
      setRemainingSeconds(null);
      return undefined;
    }

    const deadline = Date.now() + GHOSTING_DELAY_MS;

    setRemainingSeconds(5);

    const intervalId = window.setInterval(() => {
      const remaining = Math.max(
        0,
        Math.ceil((deadline - Date.now()) / 1000),
      );

      setRemainingSeconds((previous) =>
        previous === remaining ? previous : remaining,
      );
    }, 250);

    const timeoutId = window.setTimeout(() => {
      setRemainingSeconds(0);
      setPhase(RELATIONSHIP_PHASE.GHOSTED_EXIT);
    }, GHOSTING_DELAY_MS);

    return () => {
      window.clearInterval(intervalId);
      window.clearTimeout(timeoutId);
    };
  }, [
    phase,
    isWaitingForMutualResponse,
    setPhase,
  ]);

  return { remainingSeconds };
}
