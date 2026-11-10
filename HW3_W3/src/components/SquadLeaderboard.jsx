
import "./SquadLeaderboard.css";

export default function SquadLeaderboard({ squads }) {
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
            {squads.map((squad, index) => (
              <tr key={squad.squadId}>
                <td>
                  <span className="leaderboard__rank">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </td>

                <th scope="row" className="leaderboard__squad">
                  {squad.squadName}
                </th>

                <td>{squad.wwcdCount}</td>
                <td>{squad.placementPts}</td>
                <td>{squad.killPts}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <footer className="leaderboard__footer">
        <span>STANDINGS SOURCE</span>
        <strong>Development mock data</strong>
      </footer>
    </section>
  );
}
