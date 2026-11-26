export function AboutPage() {
  return (
    <article className="page">
      <h1>Architecture</h1>
      <dl className="kv-list">
        <dt>Routing</dt>
        <dd>React Router v7 — nested layout with Outlet, NavLink and route-level code splitting.</dd>
        <dt>State</dt>
        <dd>The URL is the single source of truth: category and photoId are read with useSearchParams.</dd>
        <dt>Lightbox</dt>
        <dd>Native dialog element opened with showModal(): built-in focus trap, Esc key and backdrop.</dd>
        <dt>Performance</dt>
        <dd>React.lazy + Suspense, dimension-matched skeletons, images with fixed width/height.</dd>
      </dl>
    </article>
  );
}