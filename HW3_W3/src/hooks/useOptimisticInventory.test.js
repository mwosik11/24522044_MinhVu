
import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";

import { useOptimisticInventory } from "./useOptimisticInventory.js";
import { CLAIM_STATUS } from "../domain/pubgContracts.js";

describe("useOptimisticInventory", () => {
  it("should initialize with the given stock", () => {
    const { result } = renderHook(() =>
      useOptimisticInventory(10)
    );

    expect(result.current.remainingStock).toBe(10);
    expect(result.current.claimState.status).toBe(
      CLAIM_STATUS.IDLE
    );
  });

  it("should reject invalid initial inventory", () => {
    expect(() =>
      renderHook(() => useOptimisticInventory(-1))
    ).toThrow(RangeError);

    expect(() =>
      renderHook(() => useOptimisticInventory(1.5))
    ).toThrow(RangeError);
  });

  it("should optimistically decrease stock when a claim begins", () => {
    const { result } = renderHook(() =>
      useOptimisticInventory(10)
    );

    let transaction;

    act(() => {
      transaction = result.current.beginClaim("claim-001");
    });

    expect(transaction).toEqual({
      claimId: "claim-001",
      previousStock: 10,
      optimisticStock: 9,
    });

    expect(result.current.remainingStock).toBe(9);
    expect(result.current.claimState.status).toBe(
      CLAIM_STATUS.PENDING
    );
    expect(result.current.isClaimPending).toBe(true);
  });

  it("should prevent duplicate concurrent claims", () => {
    const { result } = renderHook(() =>
      useOptimisticInventory(10)
    );

    act(() => {
      result.current.beginClaim("claim-001");
    });

    let secondTransaction;

    act(() => {
      secondTransaction =
        result.current.beginClaim("claim-002");
    });

    expect(secondTransaction).toBeNull();
    expect(result.current.remainingStock).toBe(9);
    expect(result.current.claimState.claimId).toBe(
      "claim-001"
    );
  });

  it("should not allow inventory to become negative", () => {
    const { result } = renderHook(() =>
      useOptimisticInventory(0)
    );

    let transaction;

    act(() => {
      transaction = result.current.beginClaim("claim-001");
    });

    expect(transaction).toBeNull();
    expect(result.current.remainingStock).toBe(0);
    expect(result.current.isClaimPending).toBe(false);
  });

  it("should complete a claim successfully", () => {
    const { result } = renderHook(() =>
      useOptimisticInventory(10)
    );

    act(() => {
      result.current.beginClaim("claim-001");
    });

    let completed;

    act(() => {
      completed = result.current.completeClaim("claim-001");
    });

    expect(completed).toBe(true);
    expect(result.current.remainingStock).toBe(9);
    expect(result.current.claimState.status).toBe(
      CLAIM_STATUS.SUCCESS
    );
    expect(result.current.isClaimPending).toBe(false);
  });

  it("should not complete a claim with an incorrect ID", () => {
    const { result } = renderHook(() =>
      useOptimisticInventory(10)
    );

    act(() => {
      result.current.beginClaim("claim-001");
    });

    let completed;

    act(() => {
      completed = result.current.completeClaim("claim-999");
    });

    expect(completed).toBe(false);
    expect(result.current.remainingStock).toBe(9);
    expect(result.current.claimState.status).toBe(
      CLAIM_STATUS.PENDING
    );
  });

  it("should restore stock after HTTP 409 Conflict", () => {
    const { result } = renderHook(() =>
      useOptimisticInventory(10)
    );

    act(() => {
      result.current.beginClaim("claim-001");
    });

    expect(result.current.remainingStock).toBe(9);

    let rejected;

    act(() => {
      rejected = result.current.rejectClaim(
        "claim-001",
        409,
        "Inventory conflict."
      );
    });

    expect(rejected).toBe(true);
    expect(result.current.remainingStock).toBe(10);
    expect(result.current.claimState.status).toBe(
      CLAIM_STATUS.CONFLICT
    );
    expect(result.current.claimState.error).toBe(
      "Inventory conflict."
    );
    expect(result.current.isClaimPending).toBe(false);
  });

  it("should restore stock after a general server error", () => {
    const { result } = renderHook(() =>
      useOptimisticInventory(10)
    );

    act(() => {
      result.current.beginClaim("claim-001");
    });

    act(() => {
      result.current.rejectClaim(
        "claim-001",
        500,
        "Internal server error."
      );
    });

    expect(result.current.remainingStock).toBe(10);
    expect(result.current.claimState.status).toBe(
      CLAIM_STATUS.ERROR
    );
    expect(result.current.claimState.error).toBe(
      "Internal server error."
    );
  });

  it("should ignore rollback from an unrelated claim ID", () => {
    const { result } = renderHook(() =>
      useOptimisticInventory(10)
    );

    act(() => {
      result.current.beginClaim("claim-001");
    });

    let rejected;

    act(() => {
      rejected = result.current.rejectClaim(
        "claim-999",
        409,
        "Stale response."
      );
    });

    expect(rejected).toBe(false);
    expect(result.current.remainingStock).toBe(9);
    expect(result.current.claimState.status).toBe(
      CLAIM_STATUS.PENDING
    );
  });

  it("should allow another claim after rollback", () => {
    const { result } = renderHook(() =>
      useOptimisticInventory(10)
    );

    act(() => {
      result.current.beginClaim("claim-001");
    });

    act(() => {
      result.current.rejectClaim("claim-001", 409);
    });

    let nextTransaction;

    act(() => {
      nextTransaction =
        result.current.beginClaim("claim-002");
    });

    expect(nextTransaction).not.toBeNull();
    expect(nextTransaction.claimId).toBe("claim-002");
    expect(result.current.remainingStock).toBe(9);
    expect(result.current.claimState.status).toBe(
      CLAIM_STATUS.PENDING
    );
  });
});
