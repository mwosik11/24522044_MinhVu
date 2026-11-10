
import { useId, useMemo, useState } from "react";
import "./SquadLeaderboard.css";

export default function SquadLeaderboard({ squads }) {
  const searchId = useId();
  const sortId = useId();

  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("wwcdCount");

  // Derived state: filter and sort without mutating source data.
  const visibleSquads = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return squads
      .filter((squad) =>
        squad.squadName.toLowerCase().includes(normalizedQuery)
      )
      .toSorted((a, b) => {
        if (sortBy === "squadName") {
          return a.squadName.localeCompare(b.squadName);
        }

        return (
          b[sortBy] - a[sortBy] ||
          a.squadName.localeCompare(b.squadName)
        );
      });
  }, [squads, searchQuery, sortBy]);

  const sortLabels = {
    wwcdCount: "WWCD",
    placementPts: "Placement Points",
    killPts: "Kill Points",
    squadName: "Squad Name (A–Z)",
  };

  return (
    <section
      className="leaderboard"
      aria-labelledby="leaderboard-title"
    >
      <header className="leaderboard__header">
        <div>
          <span className="leaderboard__eyebrow">
            PUBG VIETNAM SERIES
          </span>

          <h2 id="leaderboard-title">
            Squad Leaderboard
          </h2>

          <p>
            Championship performance and team statistics
          </p>
        </div>

        <span className="leaderboard__count">
          {squads.length} SQUADS
        </span>
      </header>

      <div className="leaderboard__controls">
        <div className="leaderboard__field">
          <label htmlFor={searchId}>
            Search Squad
          </label>

          <input
            id={searchId}
            type="search"
            placeholder="Enter squad name..."
            value={searchQuery}
            onChange={(event) =>
              setSearchQuery(event.target.value)
            }
          />
        </div>

        <div className="leaderboard__field">
          <label htmlFor={sortId}>
            Sort By
          </label>

          <select
            id={sortId}
            value={sortBy}
            onChange={(event) =>
              setSortBy(event.target.value)
            }
          >
            <option value="wwcdCount">
              WWCD
            </option>

            <option value="placementPts">
              Placement Points
            </option>

            <option value="killPts">
              Kill Points
            </option>

            <option value="squadName">
              Squad Name (A–Z)
            </option>
          </select>
        </div>
      </div>

      <p
        className="leaderboard__result-count"
        role="status"
        aria-live="polite"
      >
        Showing {visibleSquads.length} of {squads.length} squads
      </p>

      <div className="leaderboard__table-wrap">
        <table className="leaderboard__table">
          <caption className="visually-hidden">
            PUBG Vietnam squad standings by WWCD,
            placement points, and kill points
          </caption>

          <thead>
            <tr>
              <th scope="col">RANK</th>
              <th scope="col">SQUAD</th>
              <th scope="col">WWCD</th>
              <th scope="col">PLACEMENT PTS</th>
              <th scope="col">KILL PTS</th>
            </tr>
          </thead>

          <tbody>
            {visibleSquads.length > 0 ? (
              visibleSquads.map((squad, index) => (
                <tr key={squad.squadId}>
                  <td>
                    <span className="leaderboard__rank">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                  </td>

                  <th
                    scope="row"
                    className="leaderboard__squad"
                  >
                    {squad.squadName}
                  </th>

                  <td>{squad.wwcdCount}</td>
                  <td>{squad.placementPts}</td>
                  <td>{squad.killPts}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="leaderboard__empty">
                  No squads match your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <footer className="leaderboard__footer">
        <span>
          SORTED BY
        </span>

        <strong>
          {sortLabels[sortBy]}
        </strong>
      </footer>
    </section>
  );
}
