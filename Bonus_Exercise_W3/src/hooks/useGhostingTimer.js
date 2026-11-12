
import { useEffect } from "react";

import { RELATIONSHIP_PHASE } from "../domain/relationshipMachine.js";

const GHOSTING_DELAY_MS = 5000;

/**
 * Automatically exits a situationship after 5 seconds.
 *
 * The pending timer is cleared when:
 * - The relationship phase changes.
 * - The watched input changes.
 * - The component unmounts.
 *
 * @param {string} phase
 * @param {number} myTries
 * @param {Function} setPhase
 */
export function useGhostingTimer(phase, myTries, setPhase) {
  useEffect(() => {
    if (phase !== RELATIONSHIP_PHASE.DATING_NO_LOVE) {
      return undefined;
    }

    const timerId = window.setTimeout(() => {
      setPhase(RELATIONSHIP_PHASE.GHOSTED_EXIT);
    }, GHOSTING_DELAY_MS);

    return () => {
      window.clearTimeout(timerId);
    };
  }, [phase, myTries, setPhase]);
}
