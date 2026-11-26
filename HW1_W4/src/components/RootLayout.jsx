 import { Suspense } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router';
import { RouteSkeleton } from './RouteSkeleton.jsx';

const SITE_TITLE = import.meta.env.VITE_SITE_TITLE || 'Evidence Gallery';

const NAV_ITEMS = [
  { to: '/', label: 'Home', end: true },
  { to: '/gallery', label: 'Gallery', end: false },
  { to: '/about', label: 'Architecture', end: false },
];

const navClass = ({ isActive }) => (isActive ? 'nav-link nav-link--active' : 'nav-link');

export function RootLayout() {
  const { pathname } = useLocation();

  return (
    <>
      <a className="skip-link" href="#main-content">
        Skip to main content
      </a>
      <header className="site-header">
        <p className="site-title">
          <span aria-hidden="true">◉ </span>
          {SITE_TITLE}
        </p>
        <nav aria-label="Main navigation">
          <ul className="nav-list">
            {NAV_ITEMS.map((item) => (
              <li key={item.to}>
                {/* NavLink sets aria-current="page" automatically when active */}
                <NavLink to={item.to} end={item.end} className={navClass}>
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </header>

      <main id="main-content" tabIndex={-1} className="site-main">
        {/* key={pathname}: show the skeleton again when switching lazy routes */}
        <Suspense key={pathname} fallback={<RouteSkeleton />}>
          <Outlet />
        </Suspense>
      </main>

      <footer className="site-footer">
        <p>Lab 4 · HW1 — React 19 + React Router v7 · UIT S3T</p>
      </footer>
    </>
  );
}