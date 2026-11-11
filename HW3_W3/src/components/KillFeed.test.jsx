
import { describe, it, expect } from "vitest";
import {
  render,
  screen,
  within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import KillFeed from "./KillFeed.jsx";

const testEvents = [
  {
    id: "kill-001",
    killer: "TE_Spectre",
    victim: "CES_Raven",
    weapon: "M416",
    timestamp: 1700000000000,
  },
  {
    id: "kill-002",
    killer: "CES_Blaze",
    victim: "GE_Shadow",
    weapon: "AWM",
    timestamp: 1700000005000,
  },
  {
    id: "kill-003",
    killer: "AGG_Viper",
    victim: "TE_Hunter",
    weapon: "AKM",
    timestamp: 1700000010000,
  },
];

describe("KillFeed", () => {
  it("should render all elimination events", () => {
    render(<KillFeed events={testEvents} />);

    expect(
      screen.getByText("TE_Spectre")
    ).toBeInTheDocument();

    expect(
      screen.getByText("CES_Blaze")
    ).toBeInTheDocument();

    expect(
      screen.getByText("AGG_Viper")
    ).toBeInTheDocument();

    expect(
      screen.getByText("3 EVENTS")
    ).toBeInTheDocument();
  });

  it("should display the newest event first", () => {
    render(<KillFeed events={testEvents} />);

    const eventItems = screen
      .getAllByRole("listitem");

    expect(eventItems).toHaveLength(3);

    expect(eventItems[0]).toHaveTextContent("AGG_Viper");
    expect(eventItems[1]).toHaveTextContent("CES_Blaze");
    expect(eventItems[2]).toHaveTextContent("TE_Spectre");
  });

  it("should search killer names case-insensitively", async () => {
    const user = userEvent.setup();

    render(<KillFeed events={testEvents} />);

    await user.type(
      screen.getByRole("searchbox", {
        name: "Search Events",
      }),
      "te_spectre"
    );

    expect(
      screen.getByText("TE_Spectre")
    ).toBeInTheDocument();

    expect(
      screen.queryByText("CES_Blaze")
    ).not.toBeInTheDocument();
  });

  it("should search victim names", async () => {
    const user = userEvent.setup();

    render(<KillFeed events={testEvents} />);

    await user.type(
      screen.getByRole("searchbox", {
        name: "Search Events",
      }),
      "GE_Shadow"
    );

    expect(
      screen.getByText("CES_Blaze")
    ).toBeInTheDocument();

    expect(
      screen.queryByText("TE_Spectre")
    ).not.toBeInTheDocument();
  });

  it("should search weapon names", async () => {
    const user = userEvent.setup();

    render(<KillFeed events={testEvents} />);

    await user.type(
      screen.getByRole("searchbox", {
        name: "Search Events",
      }),
      "awm"
    );

    expect(
      screen.getByText("CES_Blaze")
    ).toBeInTheDocument();

    expect(
      screen.queryByText("AGG_Viper")
    ).not.toBeInTheDocument();
  });

  it("should filter events by selected weapon", async () => {
    const user = userEvent.setup();

    render(<KillFeed events={testEvents} />);

    await user.selectOptions(
      screen.getByRole("combobox", {
        name: "Filter by Weapon",
      }),
      "M416"
    );

    expect(
      screen.getByText("TE_Spectre")
    ).toBeInTheDocument();

    expect(
      screen.queryByText("CES_Blaze")
    ).not.toBeInTheDocument();

    expect(
      screen.getByRole("status")
    ).toHaveTextContent("Showing 1 of 3 events");
  });

  it("should display an empty state when no event matches", async () => {
    const user = userEvent.setup();

    render(<KillFeed events={testEvents} />);

    await user.type(
      screen.getByRole("searchbox", {
        name: "Search Events",
      }),
      "unknown-player"
    );

    expect(
      screen.getByText(
        "No elimination events match your filters."
      )
    ).toBeInTheDocument();
  });

  it("should not mutate the original event array", async () => {
    const user = userEvent.setup();

    const originalOrder = testEvents.map(
      (event) => event.id
    );

    render(<KillFeed events={testEvents} />);

    await user.selectOptions(
      screen.getByRole("combobox", {
        name: "Filter by Weapon",
      }),
      "AWM"
    );

    expect(
      testEvents.map((event) => event.id)
    ).toEqual(originalOrder);
  });
});
