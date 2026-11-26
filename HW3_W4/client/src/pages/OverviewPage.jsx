import { Link, useOutletContext } from 'react-router';

export function OverviewPage() {
  const { players } = useOutletContext();

  return (
    <section className="page" aria-labelledby="overview-heading">
      <h1 id="overview-heading">Fair-Play Appeal Tribunal</h1>
      <p className="lead">
        Review a player&apos;s sanction, check whether it is proportionate to the evidence, and file an appeal before
        the SLA deadline.
      </p>
      {players.status === 'success' && (
        <ul className="overview-list">
          {players.players.map((p) => (
            <li key={p.playerId}>
              <Link to={`/dossier/${p.playerId}`}>Open {p.handle}&apos;s dossier</Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}