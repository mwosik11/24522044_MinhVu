
import './BlueZoneSkeleton.css';

export default function BlueZoneSkeleton() {
  return (
    <section
      className="blue-zone-skeleton"
      aria-busy="true"
      aria-label="Loading PUBG match telemetry"
    >
      <div className="skeleton-line skeleton-title" />
      <div className="skeleton-line skeleton-medium" />
      <div className="skeleton-line skeleton-short" />
      <div className="skeleton-line skeleton-medium" />
    </section>
  );
}
