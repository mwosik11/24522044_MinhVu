/** Pure display of derived values — nothing here is stored state. */
export function ScoreBoard({ score, stats, remainingCount }) {
  return (
    <section className="scoreboard" aria-labelledby="score-heading">
      <h2 id="score-heading" className="visually-hidden">
        Score
      </h2>
      <dl className="scoreboard__list">
        <div className="scoreboard__item scoreboard__item--total">
          <dt>Score</dt>
          <dd data-testid="score">{score}</dd>
        </div>
        <div className="scoreboard__item">
          <dt>Liked</dt>
          <dd>{stats.LIKE}</dd>
        </div>
        <div className="scoreboard__item">
          <dt>Passed</dt>
          <dd>{stats.NOPE}</dd>
        </div>
        <div className="scoreboard__item">
          <dt>Friendzoned</dt>
          <dd>{stats.FRIENDZONE}</dd>
        </div>
        <div className="scoreboard__item">
          <dt>Left</dt>
          <dd>{remainingCount}</dd>
        </div>
      </dl>
      <p className="scoreboard__rules">Like +10 · Nope −5 · Friendzone −5</p>
    </section>
  );
}