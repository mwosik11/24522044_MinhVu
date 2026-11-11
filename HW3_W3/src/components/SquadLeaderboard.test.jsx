
import { describe, it, expect } from "vitest";
import {
  render,
  screen,
  within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import SquadLeaderboard from "./SquadLeaderboard.jsx";

const testSquads = [
  {
    squadId: "te",
    squadName: "The Expendables",
    wwcdCount: 3,
    placementPts: 145,
    killPts: 98,
  },
  {
    squadId: "ces",
    squadName: "Cerberus Esports",
    wwcdCount: 2,
    placementPts: 132,
    killPts: 110,
  },
  {
    squadId: "ge",
    squadName: "Roy Esports",
    wwcdCount: 1,
    placementPts: 121,
    killPts: 125,
  },
  {
    squadId: "agg",
    squadName: "AGG",
    wwcdCount: 1,
    placementPts: 105,
    killPts: 90,
  },
];

function getSquadOrder() {
  return screen
    .getAllByRole("row")
    .slice(1)
    .map((row) =>
      within(row).getByRole("rowheader").textContent
    );
}

describe("SquadLeaderboard", () => {
  it("should render all four squads", () => {
    render(<SquadLeaderboard squads={testSquads} />);

    expect(
      screen.getByText("The Expendables")
    ).toBeInTheDocument();

    expect(
      screen.getByText("Cerberus Esports")
    ).toBeInTheDocument();

    expect(
      screen.getByText("Roy Esports")
    ).toBeInTheDocument();

    expect(
      screen.getByText("AGG")
    ).toBeInTheDocument();

    expect(screen.getByText("4 SQUADS")).toBeInTheDocument();
  });

  it("should filter squads by name case-insensitively", async () => {
    const user = userEvent.setup();

    render(<SquadLeaderboard squads={testSquads} />);

    await user.type(
      screen.getByRole("searchbox", {
        name: "Search Squad",
      }),
      "cerberus"
    );

    expect(
      screen.getByText("Cerberus Esports")
    ).toBeInTheDocument();

    expect(
      screen.queryByText("The Expendables")
    ).not.toBeInTheDocument();

    expect(
      screen.getByRole("status")
    ).toHaveTextContent("Showing 1 of 4 squads");
  });

  it("should display an empty state when no squad matches", async () => {
    const user = userEvent.setup();

    render(<SquadLeaderboard squads={testSquads} />);

    await user.type(
      screen.getByRole("searchbox", {
        name: "Search Squad",
      }),
      "unknown-team"
    );

    expect(
      screen.getByText("No squads match your search.")
    ).toBeInTheDocument();

    expect(
      screen.getByRole("status")
    ).toHaveTextContent("Showing 0 of 4 squads");
  });

  it("should sort squads by WWCD descending", async () => {
    const user = userEvent.setup();

    render(<SquadLeaderboard squads={testSquads} />);

    await user.selectOptions(
      screen.getByRole("combobox", {
        name: "Sort By",
      }),
      "wwcdCount"
    );

    expect(getSquadOrder()).toEqual([
      "The Expendables",
      "Cerberus Esports",
      "AGG",
      "Roy Esports",
    ]);
  });

  it("should sort squads by Placement Points descending", async () => {
    const user = userEvent.setup();

    render(<SquadLeaderboard squads={testSquads} />);

    await user.selectOptions(
      screen.getByRole("combobox", {
        name: "Sort By",
      }),
      "placementPts"
    );

    expect(getSquadOrder()).toEqual([
      "The Expendables",
      "Cerberus Esports",
      "Roy Esports",
      "AGG",
    ]);
  });

  it("should sort squads by Kill Points descending", async () => {
    const user = userEvent.setup();

    render(<SquadLeaderboard squads={testSquads} />);

    await user.selectOptions(
      screen.getByRole("combobox", {
        name: "Sort By",
      }),
      "killPts"
    );

    expect(getSquadOrder()).toEqual([
      "Roy Esports",
      "Cerberus Esports",
      "The Expendables",
      "AGG",
    ]);
  });

  it("should sort squad names alphabetically", async () => {
    const user = userEvent.setup();

    render(<SquadLeaderboard squads={testSquads} />);

    await user.selectOptions(
      screen.getByRole("combobox", {
        name: "Sort By",
      }),
      "squadName"
    );

    expect(getSquadOrder()).toEqual([
      "AGG",
      "Cerberus Esports",
      "Roy Esports",
      "The Expendables",
    ]);
  });

  it("should not mutate the original squad data when sorting", async () => {
    const user = userEvent.setup();
    const originalOrder = testSquads.map(
      (squad) => squad.squadName
    );

    render(<SquadLeaderboard squads={testSquads} />);

    await user.selectOptions(
      screen.getByRole("combobox", {
        name: "Sort By",
      }),
      "killPts"
    );

    expect(
      testSquads.map((squad) => squad.squadName)
    ).toEqual(originalOrder);
  });
});
