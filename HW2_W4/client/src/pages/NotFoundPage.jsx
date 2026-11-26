import { Link, useLocation } from 'react-router';

export function NotFoundPage() {
  const { pathname } = useLocation();
  return (
    <section className="page" role="alert">
      <h1>404 — Page not found</h1>
      <p>
        The path <code>{pathname}</code> does not exist.
      </p>
      <p>
        <Link to="/">Back to the deck</Link>
      </p>
    </section>
  );
}