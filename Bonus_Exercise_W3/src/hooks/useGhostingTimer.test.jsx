
/** @vitest-environment jsdom */

import React, { act } from "react";
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import { createRoot } from "react-dom/client";

import { RELATIONSHIP_PHASE } from "../domain/relationshipMachine.js";
import { useGhostingTimer } from "./useGhostingTimer.js";

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

function TestComponent({
  phase,
  isWaitingForMutualResponse,
  setPhase,
}) {
  const { remainingSeconds } = useGhostingTimer(
    phase,
    isWaitingForMutualResponse,
    setPhase,
  );

  return (
    <output data-testid="remaining">
      {remainingSeconds ?? "inactive"}
    </output>
  );
}

describe("useGhostingTimer", () => {
  let container;
  let root;
  let setPhase;

  async function render(
    phase,
    isWaitingForMutualResponse = false,
  ) {
    await act(async () => {
      root.render(
        <TestComponent
          phase={phase}
          isWaitingForMutualResponse={
            isWaitingForMutualResponse
          }
          setPhase={setPhase}
        />,
      );
    });
  }

  beforeEach(() => {
    vi.useFakeTimers();

    container = document.createElement("div");
    root = createRoot(container);

    setPhase = vi.fn();
  });

  afterEach(async () => {
    if (root) {
      await act(async () => {
        root.unmount();
      });
    }

    vi.clearAllTimers();
    vi.useRealTimers();
  });

  it("does not start before the first effort signal", async () => {
    await render(
      RELATIONSHIP_PHASE.DATING_NO_LOVE,
      false,
    );

    await act(async () => {
      vi.advanceTimersByTime(5000);
    });

    expect(setPhase).not.toHaveBeenCalled();
  });

  it("does not trigger before 5 seconds after the first signal", async () => {
    await render(
      RELATIONSHIP_PHASE.DATING_NO_LOVE,
      true,
    );

    expect(
      container.querySelector("output").textContent,
    ).toBe("5");

    await act(async () => {
      vi.advanceTimersByTime(4999);
    });

    expect(setPhase).not.toHaveBeenCalled();
  });

  it("transitions to GHOSTED_EXIT after 5 seconds", async () => {
    await render(
      RELATIONSHIP_PHASE.DATING_NO_LOVE,
      true,
    );

    await act(async () => {
      vi.advanceTimersByTime(5000);
    });

    expect(setPhase).toHaveBeenCalledTimes(1);

    expect(setPhase).toHaveBeenCalledWith(
      RELATIONSHIP_PHASE.GHOSTED_EXIT,
    );
  });

  it("cancels the timer when the relationship phase changes", async () => {
    await render(
      RELATIONSHIP_PHASE.DATING_NO_LOVE,
      true,
    );

    await render(
      RELATIONSHIP_PHASE.OFFICIAL_LOVE,
      true,
    );

    await act(async () => {
      vi.advanceTimersByTime(5000);
    });

    expect(setPhase).not.toHaveBeenCalled();
  });

  it("cancels the timer when reciprocal effort is recorded", async () => {
    await render(
      RELATIONSHIP_PHASE.DATING_NO_LOVE,
      true,
    );

    await act(async () => {
      vi.advanceTimersByTime(2000);
    });

    await render(
      RELATIONSHIP_PHASE.DATING_NO_LOVE,
      false,
    );

    await act(async () => {
      vi.advanceTimersByTime(5000);
    });

    expect(setPhase).not.toHaveBeenCalled();

    expect(
      container.querySelector("output").textContent,
    ).toBe("inactive");
  });

  it("does not start outside DATING_NO_LOVE", async () => {
    await render(
      RELATIONSHIP_PHASE.FRIENDS,
      true,
    );

    await act(async () => {
      vi.advanceTimersByTime(5000);
    });

    expect(setPhase).not.toHaveBeenCalled();
  });

  it("cleans up the timer when the component unmounts", async () => {
    await render(
      RELATIONSHIP_PHASE.DATING_NO_LOVE,
      true,
    );

    await act(async () => {
      root.unmount();
    });

    root = null;

    await act(async () => {
      vi.advanceTimersByTime(5000);
    });

    expect(setPhase).not.toHaveBeenCalled();
  });
});
