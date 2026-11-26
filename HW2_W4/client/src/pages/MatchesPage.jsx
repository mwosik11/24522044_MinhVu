import { Link } from 'react-router';
import { useDeck } from '../context/DeckContext.jsx';
import { ACTIONS } from '../lib/swipeLogic.js';

function ProfileList({ label, profiles }) {
  if (profiles.length === 0) return <p className="empty">None yet.</p>;
  return (
    <ul className="match-list" aria-label={label}>
      {profiles.map((p) => (
        <li key={p.slug} className="match">
          <span className="match__name">
            {p.name}, {p.age}
          </span>{' '}
          <span className="match__city">{p.city}</span>
        </li>
      ))}
    </ul>
  );
}

export function MatchesPage() {
  const { history, profileBySlug } = useDeck();

  // Derived from the same history stack — undoing on the deck updates this page too.
  const byAction = (action) =>
    history
      .filter((entry) => entry.action === action)
      .map((entry) => profileBySlug(entry.profileSlug))
      .filter(Boolean);

  return (
    <section className="page" aria-labelledby="matches-heading">
      <h1 id="matches-heading">Your matches</h1>
      <h2>Liked</h2>
      <ProfileList label="Liked profiles" profiles={byAction(ACTIONS.LIKE)} />
      <h2>Friendzoned</h2>
      <ProfileList label="Friendzoned profiles" profiles={byAction(ACTIONS.FRIENDZONE)} />
      <p>
        <Link to="/">Back to the deck</Link>
      </p>
    </section>
  );
}