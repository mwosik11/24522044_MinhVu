
import { useCallback, useReducer, useRef, useState } from "react";

import { CLAIM_STATUS } from "../domain/pubgContracts.js";

import {
  CLAIM_ACTION,
  createInitialClaimState,
  claimReducer,
} from "../domain/claimStateMachine.js";

/**
 * Manage inventory with optimistic updates and rollback.
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

  const stockRef = useRef(initialStock);
  const pendingReservationRef = useRef(null);

  /**
   * Reserve one inventory unit immediately.
   * Returns a transaction snapshot or null.
   */
  const beginClaim = useCallback((claimId) => {
    if (
      typeof claimId !== "string" ||
      claimId.trim() === ""
    ) {
      return null;
    }

    // Prevent concurrent or duplicate claims.
    if (pendingReservationRef.current !== null) {
      return null;
    }

    // Inventory must remain non-negative.
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

    // Lock the transaction and save its rollback snapshot.
    pendingReservationRef.current = transaction;

    stockRef.current = optimisticStock;
    setRemainingStock(optimisticStock);

    dispatchClaim({
      type: CLAIM_ACTION.START,
      claimId,
    });

    return transaction;
  }, []);

  /**
   * Confirm the reservation after successful server processing.
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

    // Release the in-flight lock.
    pendingReservationRef.current = null;

    return true;
  }, []);

  /**
   * Reject a claim and restore the previous inventory.
   *
   * @param {string} claimId
   * @param {number} statusCode
   * @param {string} message
   * @returns {boolean}
   */
  const rejectClaim = useCallback((
    claimId,
    statusCode,
    message
  ) => {
    const transaction = pendingReservationRef.current;

    // Ignore stale or unrelated responses.
    if (!transaction || transaction.claimId !== claimId) {
      return false;
    }

    // Restore the exact stock snapshot.
    stockRef.current = transaction.previousStock;
    setRemainingStock(transaction.previousStock);

    if (statusCode === 409) {
      dispatchClaim({
        type: CLAIM_ACTION.CONFLICT,
        claimId,
        message:
          message || "The item is no longer available.",
      });
    } else {
      dispatchClaim({
        type: CLAIM_ACTION.ERROR,
        claimId,
        message:
          message || "The claim request failed.",
      });
    }

    // Allow another claim attempt.
    pendingReservationRef.current = null;

    return true;
  }, []);

  return {
    remainingStock,
    claimState,
    isClaimPending: claimState.status === CLAIM_STATUS.PENDING,
    beginClaim,
    completeClaim,
    rejectClaim,
  };
}
