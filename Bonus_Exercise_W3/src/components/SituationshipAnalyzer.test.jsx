
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

import {
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";

import { RELATIONSHIP_PHASE } from "../domain/relationshipMachine.js";
import { SituationshipAnalyzer } from "./SituationshipAnalyzer.jsx";
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const randomUUID = vi.fn();

describe("SituationshipAnalyzer", () => {
  beforeEach(() => {
    vi.useFakeTimers();

    randomUUID
      .mockReset()
      .mockReturnValueOnce("my-effort-001")
      .mockReturnValueOnce("rival-effort-001");

    vi.stubGlobal("crypto", {
      randomUUID,
    });
  });

  afterEach(() => {
    cleanup();
    vi.clearAllTimers();
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("renders the analyzer with its initial relationship phase", () => {
    render(<SituationshipAnalyzer />);

    expect(
      screen.getByRole("heading", {
        name: "Situationship Analyzer",
      }),
    ).toBeTruthy();

    expect(
      screen.getByText(/Current phase:/).textContent,
    ).toContain("Dating Without Love");

    expect(screen.getByRole("status").textContent).toContain(
      "[OK]",
    );
  });

  it("provides accessible labels for effort inputs", () => {
    render(<SituationshipAnalyzer />);

    const myInput = screen.getByLabelText(
      "My effort (number of tries)",
    );

    const rivalInput = screen.getByLabelText(
      "Rival effort (number of tries)",
    );

    expect(myInput.value).toBe("100");
    expect(rivalInput.value).toBe("1");
  });

  it("records effort signals and calculates total impacts", () => {
    render(<SituationshipAnalyzer />);

    fireEvent.click(
      screen.getByRole("button", {
        name: "Record My Effort",
      }),
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "Record Rival Effort",
      }),
    );

    expect(screen.getByText("My impact: 10.00")).toBeTruthy();
    expect(screen.getByText("Rival impact: 50.00")).toBeTruthy();

    expect(screen.getByText("Steps: 100")).toBeTruthy();
    expect(screen.getByText("Steps: 1")).toBeTruthy();

    expect(screen.getByText("Impact: 10.00")).toBeTruthy();
    expect(screen.getByText("Impact: 50.00")).toBeTruthy();
  });

  it("derives the red-flag status from recorded effort totals", () => {
    render(<SituationshipAnalyzer />);

    const status = screen.getByRole("status");

    expect(status.textContent).toContain("[OK]");

    fireEvent.click(
      screen.getByRole("button", {
        name: "Record My Effort",
      }),
    );

    expect(status.textContent).toContain("[OK]");

    fireEvent.click(
      screen.getByRole("button", {
        name: "Record Rival Effort",
      }),
    );

    expect(status.textContent).toContain("[RED-FLAG]");
  });

  
    it("transitions to OFFICIAL_LOVE and cancels the ghosting timer", () => {
    render(<SituationshipAnalyzer />);

    // First participant starts the reply window.
    fireEvent.click(
        screen.getByRole("button", {
        name: "Record My Effort",
        }),
    );

    fireEvent.click(
        screen.getByRole("button", {
        name: "Commit",
        }),
    );

    expect(
        screen.getByText(/Current phase:/).textContent,
    ).toContain("Official Love");

    act(() => {
        vi.advanceTimersByTime(5000);
    });

    expect(
        screen.getByText(/Current phase:/).textContent,
    ).toContain("Official Love");
    });


  it("transitions to GHOSTED_EXIT when Stop and Exit is clicked", () => {
    render(<SituationshipAnalyzer />);

    fireEvent.click(
      screen.getByRole("button", {
        name: "Stop and Exit",
      }),
    );

    expect(
      screen.getByText(/Current phase:/).textContent,
    ).toContain("Ghosted Exit");
  });

  
    it("automatically exits after the 5-second ghosting timeout", () => {
    render(<SituationshipAnalyzer />);

    // The first effort signal starts the timer.
    fireEvent.click(
        screen.getByRole("button", {
        name: "Record My Effort",
        }),
    );

    act(() => {
        vi.advanceTimersByTime(5000);
    });

    expect(
        screen.getByText(/Current phase:/).textContent,
    ).toContain("Ghosted Exit");
    });


it("cancels the ghosting timer when the rival responds", () => {
  render(<SituationshipAnalyzer />);

  fireEvent.click(
    screen.getByRole("button", {
      name: "Record My Effort",
    }),
  );

  // Rival responds before the timeout expires.
  fireEvent.click(
    screen.getByRole("button", {
      name: "Record Rival Effort",
    }),
  );

  act(() => {
    vi.advanceTimersByTime(5000);
  });

  expect(
    screen.getByText(/Current phase:/).textContent,
  ).toContain("Dating Without Love");

  expect(
    screen.getByText("Mutual effort recorded"),
  ).toBeTruthy();
});

});
