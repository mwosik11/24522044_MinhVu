
/** @vitest-environment jsdom */

import React, { act } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createRoot } from "react-dom/client";

import { RELATIONSHIP_PHASE } from "../domain/relationshipMachine.js";
import { useGhostingTimer } from "./useGhostingTimer.js";

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

function TestComponent({ phase, myTries, setPhase }) {
  useGhostingTimer(phase, myTries, setPhase);
  return null;
}

describe("useGhostingTimer", () => {
  let container;
  let root;
  let setPhase;

  async function render(phase, myTries = 100) {
    await act(async () => {
      root.render(
        <TestComponent
          phase={phase}
          myTries={myTries}
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

  it("does not trigger before 5 seconds", async () => {
    await render(RELATIONSHIP_PHASE.DATING_NO_LOVE);

    await act(async () => {
      vi.advanceTimersByTime(4999);
    });

    expect(setPhase).not.toHaveBeenCalled();
  });

  it("transitions to GHOSTED_EXIT after 5 seconds", async () => {
    await render(RELATIONSHIP_PHASE.DATING_NO_LOVE);

    await act(async () => {
      vi.advanceTimersByTime(5000);
    });

    expect(setPhase).toHaveBeenCalledTimes(1);

    expect(setPhase).toHaveBeenCalledWith(
      RELATIONSHIP_PHASE.GHOSTED_EXIT,
    );
  });

  it("cancels the timer when the relationship phase changes", async () => {
    await render(RELATIONSHIP_PHASE.DATING_NO_LOVE);

    await render(RELATIONSHIP_PHASE.OFFICIAL_LOVE);

    await act(async () => {
      vi.advanceTimersByTime(5000);
    });

    expect(setPhase).not.toHaveBeenCalled();
  });

  it("cancels and restarts the timer when myTries changes", async () => {
    await render(RELATIONSHIP_PHASE.DATING_NO_LOVE, 100);

    await act(async () => {
      vi.advanceTimersByTime(3000);
    });

    await render(RELATIONSHIP_PHASE.DATING_NO_LOVE, 101);

    await act(async () => {
      vi.advanceTimersByTime(4999);
    });

    expect(setPhase).not.toHaveBeenCalled();

    await act(async () => {
      vi.advanceTimersByTime(1);
    });

    expect(setPhase).toHaveBeenCalledWith(
      RELATIONSHIP_PHASE.GHOSTED_EXIT,
    );
  });

  it("does not start a timer outside DATING_NO_LOVE", async () => {
    await render(RELATIONSHIP_PHASE.FRIENDS);

    await act(async () => {
      vi.advanceTimersByTime(5000);
    });

    expect(setPhase).not.toHaveBeenCalled();
  });

  it("cleans up the timer when the component unmounts", async () => {
    await render(RELATIONSHIP_PHASE.DATING_NO_LOVE);

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
