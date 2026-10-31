
import './BlueZoneSkeleton.css';

export default function BlueZoneSkeleton() {
  return (
    <section
      className="blue-zone-skeleton"
      aria-busy="true"
      aria-label="Loading PUBG match telemetry"
    >
      <header className="blue-zone-skeleton__header">
        <span className="skeleton-line skeleton-line--label" />
        <span className="skeleton-line skeleton-line--badge" />
      </header>

      <span className="skeleton-line skeleton-line--title" />
      <span className="skeleton-line skeleton-line--subtitle" />

      <section
        className="blue-zone-skeleton__metrics"
        aria-hidden="true"
      >
        <span className="skeleton-metric" />
        <span className="skeleton-metric" />
        <span className="skeleton-metric" />
      </section>
    </section>
  );
}
