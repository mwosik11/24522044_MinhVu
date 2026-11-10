
import { useCallback, useReducer, useRef, useState } from "react";

import {
  CLAIM_ACTION,
  createInitialClaimState,
  claimReducer,
} from "../domain/claimStateMachine.js";

/**
 * Manage inventory using optimistic stock reservation.
 *
 * @param {number} initialStock
 */
export function useOptimisticInventory(initialStock) {
  if (!Number.isSafeInteger(initialStock) || initialStock < 0) {
    throw new RangeError(
      "Initial inventory must be a non-negative safe integer."
    );
  }

  const [remainingStock, setRemainingStock] = useState(initialStock);

  const [claimState, dispatchClaim] = useReducer(
    claimReducer,
    undefined,
    createInitialClaimState
  );

  // Synchronous inventory reference.
  const stockRef = useRef(initialStock);

  // Prevent duplicate concurrent claims.
  const pendingReservationRef = useRef(null);

  /**
   * Reserve one inventory unit immediately.
   *
   * Returns the transaction snapshot or null when
   * the claim cannot be started.
   */
  const beginClaim = useCallback((claimId) => {
    if (
      typeof claimId !== "string" ||
      claimId.trim() === ""
    ) {
      return null;
    }

    // Prevent double-submit.
    if (pendingReservationRef.current !== null) {
      return null;
    }

    // Prevent negative inventory.
    if (stockRef.current <= 0) {
      return null;
    }

    const previousStock = stockRef.current;
    const optimisticStock = previousStock - 1;

    const transaction = Object.freeze({
      claimId,
      previousStock,
      optimisticStock,
    });

    // Save snapshot before updating inventory.
    pendingReservationRef.current = transaction;

    // Update the synchronous reference.
    stockRef.current = optimisticStock;

    // Update React UI immediately.
    setRemainingStock(optimisticStock);

    // Transition claim lifecycle to PENDING.
    dispatchClaim({
      type: CLAIM_ACTION.START,
      claimId,
    });

    return transaction;
  }, []);

  /**
   * Confirm an optimistic reservation after
   * successful claim processing.
   */
  const completeClaim = useCallback((claimId) => {
    const transaction = pendingReservationRef.current;

    if (!transaction || transaction.claimId !== claimId) {
      return false;
    }

    dispatchClaim({
      type: CLAIM_ACTION.SUCCESS,
      claimId,
    });

    pendingReservationRef.current = null;

    return true;
  }, []);

  return {
    remainingStock,
    claimState,
    isClaimPending:
      claimState.status === "PENDING",
    beginClaim,
    completeClaim,
  };
}
