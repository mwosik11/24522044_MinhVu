/**
 * Dimension-matched fallback for lazy routes (CLS = 0).
 * Mirrors the gallery layout: heading, filter bar, 6 card placeholders.
 */
export function RouteSkeleton({ label = 'Loading page…' }) {
  return (
    <section className="skeleton" aria-busy="true" aria-live="polite">
      <p className="visually-hidden">{label}</p>
      <span className="skeleton__block skeleton__title" aria-hidden="true" />
      <span className="skeleton__block skeleton__bar" aria-hidden="true" />
      <span className="skeleton__grid" aria-hidden="true">
        {Array.from({ length: 6 }, (_, i) => (
          <span key={i} className="skeleton__block skeleton__card" />
        ))}
      </span>
    </section>
  );
}