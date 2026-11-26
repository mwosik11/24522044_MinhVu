import { Link, useLocation } from 'react-router';

export function NotFoundPage() {
  const { pathname } = useLocation();
  return (
    <article className="page" role="alert">
      <h1>404 — Page not found</h1>
      <p>
        The path <code>{pathname}</code> does not exist.
      </p>
      <p>
        <Link to="/">Back to home</Link>
      </p>
    </article>
  );
}