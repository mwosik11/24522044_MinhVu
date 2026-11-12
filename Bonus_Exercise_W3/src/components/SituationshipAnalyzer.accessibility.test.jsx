
/** @vitest-environment jsdom */

import React from "react";
import { afterEach, describe, expect, it } from "vitest";
import {
  cleanup,
  render,
  screen,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { SituationshipAnalyzer } from "./SituationshipAnalyzer.jsx";

afterEach(() => {
  cleanup();
});

describe("SituationshipAnalyzer accessibility", () => {
  it("associates every effort input with an accessible label", () => {
    render(<SituationshipAnalyzer />);

    expect(
      screen.getByLabelText("My effort (number of tries)"),
    ).toBeTruthy();

    expect(
      screen.getByLabelText("Rival effort (number of tries)"),
    ).toBeTruthy();
  });

  it("generates unique input IDs for multiple component instances", () => {
    const { container } = render(
      <>
        <SituationshipAnalyzer />
        <SituationshipAnalyzer />
      </>,
    );

    const inputs = container.querySelectorAll("input");
    const ids = Array.from(inputs).map((input) => input.id);

    expect(ids).toHaveLength(4);
    expect(new Set(ids).size).toBe(4);
    expect(ids.every((id) => id.length > 0)).toBe(true);
  });

  it("announces status changes through a polite live region", () => {
    render(<SituationshipAnalyzer />);

    const status = screen.getByRole("status");

    expect(status.getAttribute("aria-live")).toBe("polite");
    expect(status.getAttribute("aria-atomic")).toBe("true");
  });

  
    it("supports keyboard navigation and Enter activation", async () => {
    const user = userEvent.setup();

    render(<SituationshipAnalyzer />);

    await user.tab();

    const returnButton = screen.getByRole("button", {
        name: "Return to Friends",
    });

    // Verify keyboard focus using the native DOM API.
    expect(document.activeElement).toBe(returnButton);

    await user.keyboard("{Enter}");

    expect(
        screen.getByText(/Current phase:/).textContent,
    ).toContain("Friends");

    expect(
        screen.getByRole("button", { name: "Start Dating" }),
    ).toBeTruthy();
    });


  it("supports Space activation on relationship buttons", async () => {
    const user = userEvent.setup();

    render(<SituationshipAnalyzer />);

    await user.tab();
    await user.keyboard(" ");

    expect(
      screen.getByText(/Current phase:/).textContent,
    ).toContain("Friends");
  });
});
