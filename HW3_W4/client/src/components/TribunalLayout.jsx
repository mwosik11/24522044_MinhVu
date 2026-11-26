import { NavLink, Outlet } from 'react-router';
import { usePlayers } from '../hooks/usePlayers.js';
import { useServerClock } from '../hooks/useServerClock.js';

const navClass = ({ isActive }) => (isActive ? 'player-link player-link--active' : 'player-link');

/**
 * App shell. The server clock is measured ONCE here and shared with every
 * dossier through the outlet context, so switching players does not re-sync.
 */
export function TribunalLayout() {
  const players = usePlayers();
  const clock = useServerClock();

  return (
    <>
      <a className="skip-link" href="#main-content">
        Skip to main content
      </a>
      <header className="site-header">
        <p className="site-title">
          <span aria-hidden="true">⚖ </span>Fair-Play Appeal Tribunal
        </p>
      </header>

      <div className="shell">
        <nav className="sidebar" aria-label="Player dossiers">
          <h2 className="sidebar__title">Dossiers</h2>
          {players.status === 'loading' && <p aria-busy="true">Loading players…</p>}
          {players.status === 'error' && (
            <p role="alert" className="notice notice--error">
              Could not load players: {players.error}
            </p>
          )}
          {players.status === 'success' && (
            <ul className="player-list">
              {players.players.map((p) => (
                <li key={p.playerId}>
                  <NavLink to={`/dossier/${p.playerId}`} className={navClass}>
                    <span className="player-link__handle">{p.handle}</span>
                    <span className="player-link__team">{p.team}</span>
                  </NavLink>
                </li>
              ))}
            </ul>
          )}
        </nav>

        <main id="main-content" tabIndex={-1} className="site-main">
          <Outlet context={{ clock, players }} />
        </main>
      </div>

      <footer className="site-footer">
        <p>Lab 4 · HW3 — React 19 + React Router v7 + Express 5 + Mongoose 8 · UIT S3T</p>
      </footer>
    </>
  );
}