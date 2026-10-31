import { useId, useState } from 'react';
import { SMART_PEOPLE } from '../data/smartPeople';

function getInitials(name) {
  return name
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export function ScientistDirectory({
  initialData = SMART_PEOPLE,
}) {
  // Generate unique IDs for accessible form controls
  const qId = useId();
  const iqId = useId();
  const sortId = useId();

  // Independent state
  const [people, setPeople] = useState(initialData);
  const [query, setQuery] = useState('');
  const [minIq, setMinIq] = useState(160);
  const [sortBy, setSortBy] = useState('iq-desc');

  // Derived data: filter and sort during rendering
  // No useEffect and no additional state for visible records
  const normalizedQuery = query.trim().toLowerCase();

  const visible = people
    .filter(
      (person) =>
        person.name.toLowerCase().includes(normalizedQuery) &&
        person.iq >= minIq
    )
    .toSorted((a, b) =>
      sortBy === 'iq-desc'
        ? b.iq - a.iq
        : a.age - b.age
    );

  // Calculate collection statistics
  const highestIq = people.length
    ? Math.max(...people.map((person) => person.iq))
    : 0;

  const ages = people.map((person) => person.age);

  const ageRange = ages.length
    ? `${Math.min(...ages)}–${Math.max(...ages)}`
    : '—';

  return (
    <div className="directory-page">

      {/* Navigation */}
      <nav
        className="topbar"
        aria-label="Main navigation"
      >
        <a
          className="brand"
          href="#top"
          aria-label="Mind Atlas home"
        >
          <span
            className="brand-mark"
            aria-hidden="true"
          >
            <svg viewBox="0 0 32 32" fill="none">
              <path
                d="M16 3.5 28.5 16 16 28.5 3.5 16 16 3.5Z"
                stroke="currentColor"
                strokeWidth="1.5"
              />
              <path
                d="M16 9v14M9 16h14M11 11l10 10M21 11 11 21"
                stroke="currentColor"
                strokeWidth="1.25"
              />
            </svg>
          </span>

          <span className="brand-name">
            MIND<span>ATLAS</span>
          </span>
        </a>

        <div className="topbar-right">
          <span className="topbar-caption">
            A FIELD GUIDE TO EXTRAORDINARY MINDS
          </span>

          <span className="edition-pill">
            EDITION 01
            <span aria-hidden="true">↗</span>
          </span>
        </div>
      </nav>

      {/* Hero section */}
      <section
        className="hero-panel"
        id="top"
        aria-labelledby="hero-title"
      >
        <div className="hero-copy">
          <p className="eyebrow">
            <span className="eyebrow-line" />
            THE THINKERS COLLECTION
          </p>

          <h1 id="hero-title">
            Great minds.
            <br />
            <em>Endless</em> possibilities.
          </h1>

          <p className="hero-description">
            An interactive archive celebrating remarkable
            thinkers and the ideas that shaped our understanding
            of the world.
          </p>

          <div className="hero-footnote">
            <span className="footnote-index">01</span>
            <span>
              Explore the people behind the progress.
            </span>
          </div>
        </div>

        {/* Decorative orbital artwork */}
        <div
          className="hero-art"
          aria-hidden="true"
        >
          <div className="orbit orbit-one" />
          <div className="orbit orbit-two" />
          <div className="orbit orbit-three" />

          <span className="orbit-dot dot-one" />
          <span className="orbit-dot dot-two" />
          <span className="orbit-dot dot-three" />

          <div className="hero-seal">
            <span className="seal-overline">
              EST.
            </span>

            <strong>∞</strong>

            <span className="seal-caption">
              HUMAN
              <br />
              POTENTIAL
            </span>
          </div>

          <span className="art-cross cross-one">✳</span>
          <span className="art-cross cross-two">✳</span>
        </div>

        <div className="hero-bottomline">
          <span>
            SCIENCE · KNOWLEDGE · LEGACY
          </span>

          <span>
            CURATED PROFILES
            <b>—</b>
            001–{String(people.length).padStart(3, '0')}
          </span>
        </div>
      </section>

      {/* Statistics */}
      <section
        className="stats-strip"
        aria-label="Directory overview"
      >
        <div className="stat-item">
          <span className="stat-label">
            ARCHIVE SIZE
          </span>

          <strong>
            {String(people.length).padStart(2, '0')}
          </strong>

          <span className="stat-detail">
            pioneer profiles
          </span>
        </div>

        <div className="stat-item">
          <span className="stat-label">
            CURRENT VIEW
          </span>

          <strong>
            {String(visible.length).padStart(2, '0')}
          </strong>

          <span className="stat-detail">
            matching profiles
          </span>
        </div>

        <div className="stat-item">
          <span className="stat-label">
            HIGHEST IQ
          </span>

          <strong>
            {highestIq || '—'}
          </strong>

          <span className="stat-detail">
            in this collection
          </span>
        </div>

        <div className="stat-item stat-item-last">
          <span className="stat-label">
            AGE RANGE
          </span>

          <strong>
            {ageRange}
          </strong>

          <span className="stat-detail">
            years represented
          </span>
        </div>
      </section>

      {/* Directory */}
      <section
        className="archive-section"
        aria-labelledby="archive-title"
      >
        <div className="section-heading">
          <div>
            <p className="eyebrow section-eyebrow">
              DISCOVER THE ARCHIVE
            </p>

            <h2 id="archive-title">
              Meet the pioneers<span>.</span>
            </h2>
          </div>

          <p className="section-intro">
            Search by name, set an IQ threshold, or arrange
            the collection to explore each profile your way.
          </p>
        </div>

        {/* Search and filters */}
        <form
          className="filter-panel"
          role="search"
          onSubmit={(event) => event.preventDefault()}
        >
          <div className="filter-field search-field">
            <label htmlFor={qId}>
              SEARCH THE ARCHIVE
            </label>

            <div className="input-wrap">
              <svg
                className="field-icon"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
              >
                <circle
                  cx="10.8"
                  cy="10.8"
                  r="6.8"
                  stroke="currentColor"
                  strokeWidth="1.7"
                />

                <path
                  d="m16 16 4.5 4.5"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                />
              </svg>

              <input
                id={qId}
                type="search"
                value={query}
                onChange={(event) =>
                  setQuery(event.target.value)
                }
                placeholder="Try ‘Einstein’ or ‘Newton’"
                autoComplete="off"
              />
            </div>
          </div>

          <div className="filter-field compact-field">
            <label htmlFor={iqId}>
              MINIMUM IQ
            </label>

            <div className="input-wrap number-wrap">
              <input
                id={iqId}
                type="number"
                min="0"
                value={minIq}
                onChange={(event) => {
                  const value = event.target.valueAsNumber;

                  setMinIq(
                    Number.isNaN(value) ? 0 : value
                  );
                }}
              />

              <span className="field-suffix">
                IQ
              </span>
            </div>
          </div>

          <div className="filter-field sort-field">
            <label htmlFor={sortId}>
              SORT COLLECTION
            </label>

            <div className="input-wrap select-wrap">
              <select
                id={sortId}
                value={sortBy}
                onChange={(event) =>
                  setSortBy(event.target.value)
                }
              >
                <option value="iq-desc">
                  Highest IQ first
                </option>

                <option value="age-asc">
                  Youngest age first
                </option>
              </select>

              <svg
                className="select-chevron"
                viewBox="0 0 20 20"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="m5 7.5 5 5 5-5"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>
        </form>

        {/* Results heading */}
        <div className="results-heading">
          <div className="results-title-group">
            <span className="results-marker" />

            <h3>THE DIRECTORY</h3>

            <span className="results-divider" />

            <span className="results-total">
              {String(visible.length).padStart(2, '0')}
              {' '}PROFILES
            </span>
          </div>

          <p className="results-order">
            {sortBy === 'iq-desc'
              ? 'ORDERED BY IQ'
              : 'ORDERED BY AGE'}

            <span aria-hidden="true"> ↗</span>
          </p>
        </div>

        {/* Scientist cards */}
        {visible.length > 0 ? (
          <ul className="people-grid">
            {visible.map((person) => (
              <li
                className="person-card"
                key={person.id}
              >
                <div className="card-topline">
                  <span className="profile-number">
                    PROFILE /{' '}
                    {String(person.id)
                      .split('-')
                      .at(-1)
                      .padStart(2, '0')}
                  </span>

                  <span
                    className="profile-symbol"
                    aria-hidden="true"
                  >
                    ↗
                  </span>
                </div>

                <div className="person-identity">
                  <div
                    className="person-avatar"
                    aria-hidden="true"
                  >
                    {getInitials(person.name)}
                  </div>

                  <div className="person-name-wrap">
                    <h4>{person.name}</h4>

                    <span className="person-role">
                      SCIENTIFIC PIONEER
                    </span>
                  </div>
                </div>

                <div className="iq-block">
                  <div className="iq-heading">
                    <span className="metric-label">
                      INTELLIGENCE QUOTIENT
                    </span>

                    <strong>
                      {person.iq}
                      <small> IQ</small>
                    </strong>
                  </div>

                  <div
                    className="iq-track"
                    role="img"
                    aria-label={`IQ score ${person.iq} on a visual scale capped at 220`}
                  >
                    <span
                      className="iq-fill"
                      style={{
                        width: `${Math.min(
                          (person.iq / 220) * 100,
                          100
                        )}%`,
                      }}
                    />
                  </div>
                </div>

                <div className="card-footer">
                  <span className="metric-label">
                    AGE
                  </span>

                  <strong>
                    {person.age}
                    {' '}
                    <small>YEARS</small>
                  </strong>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="empty-state">
            <span
              className="empty-mark"
              aria-hidden="true"
            >
              ⌕
            </span>

            <h4>No profiles found</h4>

            <p>
              Try another name or lower the minimum IQ threshold.
            </p>
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="page-footer">
        <a
          className="footer-brand"
          href="#top"
        >
          MIND<span>ATLAS</span>
        </a>

        <span>
          AN INTERACTIVE SCIENTIST & PIONEER DIRECTORY
        </span>

        <span>
          BUILT FOR THE CURIOUS <b>✳</b>
        </span>
      </footer>
    </div>
  );
}