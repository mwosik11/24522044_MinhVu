
import { useId, useMemo, useState } from "react";
import "./KillFeed.css";

export default function KillFeed({ events }) {
  const searchId = useId();
  const weaponId = useId();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedWeapon, setSelectedWeapon] = useState("ALL");

  // Derive unique weapon options from the source data.
  const weapons = useMemo(() => {
    return [...new Set(events.map((event) => event.weapon))]
      .toSorted((a, b) => a.localeCompare(b));
  }, [events]);

  // Filter and sort without mutating the original events.
  const visibleEvents = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return events
      .filter((event) => {
        const matchesSearch =
          event.killer.toLowerCase().includes(query) ||
          event.victim.toLowerCase().includes(query) ||
          event.weapon.toLowerCase().includes(query);

        const matchesWeapon =
          selectedWeapon === "ALL" ||
          event.weapon === selectedWeapon;

        return matchesSearch && matchesWeapon;
      })
      .toSorted((a, b) => b.timestamp - a.timestamp);
  }, [events, searchQuery, selectedWeapon]);

  const formatTime = (timestamp) => {
    return new Intl.DateTimeFormat("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    }).format(new Date(timestamp));
  };

  return (
    <section
      className="kill-feed"
      aria-labelledby="kill-feed-title"
    >
      <header className="kill-feed__header">
        <div>
          <span className="kill-feed__eyebrow">
            LIVE MATCH TELEMETRY
          </span>

          <h2 id="kill-feed-title">
            PUBG Match Kill-Feed
          </h2>

          <p>
            Match elimination events and weapon activity
          </p>
        </div>

        <span className="kill-feed__count">
          {events.length} EVENTS
        </span>
      </header>

      <div className="kill-feed__controls">
        <div className="kill-feed__field">
          <label htmlFor={searchId}>
            Search Events
          </label>

          <input
            id={searchId}
            type="search"
            placeholder="Search player or weapon..."
            value={searchQuery}
            onChange={(event) =>
              setSearchQuery(event.target.value)
            }
          />
        </div>

        <div className="kill-feed__field">
          <label htmlFor={weaponId}>
            Filter by Weapon
          </label>

          <select
            id={weaponId}
            value={selectedWeapon}
            onChange={(event) =>
              setSelectedWeapon(event.target.value)
            }
          >
            <option value="ALL">All Weapons</option>

            {weapons.map((weapon) => (
              <option key={weapon} value={weapon}>
                {weapon}
              </option>
            ))}
          </select>
        </div>
      </div>

      <p
        className="kill-feed__result-count"
        role="status"
        aria-live="polite"
      >
        Showing {visibleEvents.length} of {events.length} events
      </p>

      <ol className="kill-feed__list">
        {visibleEvents.length > 0 ? (
          visibleEvents.map((event) => (
            <li
              key={event.id}
              className="kill-feed__item"
            >
              <time
                className="kill-feed__time"
                dateTime={new Date(event.timestamp).toISOString()}
              >
                {formatTime(event.timestamp)}
              </time>

              <div className="kill-feed__event">
                <strong className="kill-feed__killer">
                  {event.killer}
                </strong>

                <span className="kill-feed__action">
                  eliminated
                </span>

                <strong className="kill-feed__victim">
                  {event.victim}
                </strong>
              </div>

              <span className="kill-feed__weapon">
                {event.weapon}
              </span>
            </li>
          ))
        ) : (
          <li className="kill-feed__empty">
            No elimination events match your filters.
          </li>
        )}
      </ol>

      <footer className="kill-feed__footer">
        <span>EVENT SOURCE</span>
        <strong>Development mock data</strong>
      </footer>
    </section>
  );
}
