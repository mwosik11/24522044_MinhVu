import { Link } from 'react-router';
import { CATEGORIES } from '../data/photos.js';

export function HomePage() {
  return (
    <article className="page">
      <h1>Photo &amp; Evidence Gallery</h1>
      <p className="lead">
        Every view state — the active category and the open photo — lives in the URL. Copy the
        link and send it to a colleague: they will see exactly what you see.
      </p>
      <h2>Jump to a category</h2>
      <ul className="link-list">
        {CATEGORIES.map((c) => (
          <li key={c.slug}>
            <Link to={`/gallery?category=${c.slug}`}>{c.label}</Link>
          </li>
        ))}
      </ul>
      <p>
        <Link className="button" to="/gallery">
          Open the full gallery
        </Link>
      </p>
    </article>
  );
}