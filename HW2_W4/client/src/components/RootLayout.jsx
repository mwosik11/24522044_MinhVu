import { NavLink, Outlet } from 'react-router';
import { useDeck } from '../context/DeckContext.jsx';

const navClass = ({ isActive }) => (isActive ? 'nav-link nav-link--active' : 'nav-link');

export function RootLayout() {
  const { stats, announcement } = useDeck();

  return (
    <>
      <a className="skip-link" href="#main-content">
        Skip to main content
      </a>
      <header className="site-header">
        <p className="site-title">
          <span aria-hidden="true">♡ </span>Dating Without Love
        </p>
        <nav aria-label="Main navigation">
          <ul className="nav-list">
            <li>
              <NavLink to="/" end className={navClass}>
                Deck
              </NavLink>
            </li>
            <li>
              <NavLink to="/matches" className={navClass}>
                Matches ({stats.LIKE})
              </NavLink>
            </li>
          </ul>
        </nav>
      </header>

      <main id="main-content" tabIndex={-1} className="site-main">
        <Outlet />
      </main>

      <footer className="site-footer">
        <p>Lab 4 · HW2 — React 19 + Express 5 + Mongoose 8 · UIT S3T</p>
      </footer>

      {/* Screen readers hear every decision without moving focus. */}
      <p className="visually-hidden" role="status" aria-live="polite">
        {announcement}
      </p>
    </>
  );
}