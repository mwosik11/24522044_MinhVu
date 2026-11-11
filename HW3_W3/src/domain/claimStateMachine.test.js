 
import { describe, it, expect } from "vitest";

import {
  CLAIM_STATUS,
} from "./pubgContracts.js";

import {
  CLAIM_ACTION,
  createInitialClaimState,
  claimReducer,
} from "./claimStateMachine.js";

describe("Claim State Machine", () => {
  it("should create the initial IDLE state", () => {
    const state = createInitialClaimState();

    expect(state).toEqual({
      status: CLAIM_STATUS.IDLE,
      claimId: null,
      error: null,
    });
  });

  it("should transition from IDLE to PENDING", () => {
    const initial = createInitialClaimState();

    const next = claimReducer(initial, {
      type: CLAIM_ACTION.START,
      claimId: "claim-001",
    });

    expect(next.status).toBe(CLAIM_STATUS.PENDING);
    expect(next.claimId).toBe("claim-001");
    expect(next.error).toBeNull();
  });

  it("should reject an empty claim ID", () => {
    const initial = createInitialClaimState();

    const next = claimReducer(initial, {
      type: CLAIM_ACTION.START,
      claimId: " ",
    });

    expect(next).toBe(initial);
  });

  it("should prevent a second claim while PENDING", () => {
    const pending = claimReducer(
      createInitialClaimState(),
      {
        type: CLAIM_ACTION.START,
        claimId: "claim-001",
      }
    );

    const next = claimReducer(pending, {
      type: CLAIM_ACTION.START,
      claimId: "claim-002",
    });

    expect(next).toBe(pending);
    expect(next.claimId).toBe("claim-001");
  });

  it("should transition from PENDING to SUCCESS", () => {
    const pending = claimReducer(
      createInitialClaimState(),
      {
        type: CLAIM_ACTION.START,
        claimId: "claim-001",
      }
    );

    const next = claimReducer(pending, {
      type: CLAIM_ACTION.SUCCESS,
      claimId: "claim-001",
    });

    expect(next.status).toBe(CLAIM_STATUS.SUCCESS);
    expect(next.claimId).toBe("claim-001");
    expect(next.error).toBeNull();
  });

  it("should ignore a SUCCESS response with an incorrect claim ID", () => {
    const pending = claimReducer(
      createInitialClaimState(),
      {
        type: CLAIM_ACTION.START,
        claimId: "claim-001",
      }
    );

    const next = claimReducer(pending, {
      type: CLAIM_ACTION.SUCCESS,
      claimId: "claim-999",
    });

    expect(next).toBe(pending);
    expect(next.status).toBe(CLAIM_STATUS.PENDING);
  });

  it("should transition from PENDING to CONFLICT", () => {
    const pending = claimReducer(
      createInitialClaimState(),
      {
        type: CLAIM_ACTION.START,
        claimId: "claim-001",
      }
    );

    const next = claimReducer(pending, {
      type: CLAIM_ACTION.CONFLICT,
      claimId: "claim-001",
      message: "Inventory conflict.",
    });

    expect(next.status).toBe(CLAIM_STATUS.CONFLICT);
    expect(next.error).toBe("Inventory conflict.");
  });

  it("should transition from PENDING to ERROR", () => {
    const pending = claimReducer(
      createInitialClaimState(),
      {
        type: CLAIM_ACTION.START,
        claimId: "claim-001",
      }
    );

    const next = claimReducer(pending, {
      type: CLAIM_ACTION.ERROR,
      claimId: "claim-001",
      message: "Network failure.",
    });

    expect(next.status).toBe(CLAIM_STATUS.ERROR);
    expect(next.error).toBe("Network failure.");
  });

  it("should prevent RESET while PENDING", () => {
    const pending = claimReducer(
      createInitialClaimState(),
      {
        type: CLAIM_ACTION.START,
        claimId: "claim-001",
      }
    );

    const next = claimReducer(pending, {
      type: CLAIM_ACTION.RESET,
    });

    expect(next).toBe(pending);
  });

  it("should reset a completed claim to IDLE", () => {
    const success = {
      status: CLAIM_STATUS.SUCCESS,
      claimId: "claim-001",
      error: null,
    };

    const next = claimReducer(success, {
      type: CLAIM_ACTION.RESET,
    });

    expect(next).toEqual(createInitialClaimState());
  });

  it("should ignore unknown actions", () => {
    const initial = createInitialClaimState();

    const next = claimReducer(initial, {
      type: "UNKNOWN_ACTION",
    });

    expect(next).toBe(initial);
  });
});
